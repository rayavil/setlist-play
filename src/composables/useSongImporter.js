import { ref } from 'vue';

export function useSongImporter() {
    const loading = ref(false);
    const error = ref(null);

    async function fetchAndParse(url) {
        loading.value = true;
        error.value = null;

        try {
            // Use our own Vercel API proxy
            // In development (localhost), we might need to point to the production Vercel URL 
            // OR ensure `api/fetch-url.js` is running via `vercel dev`.
            // For now, let's assume relative path '/api/fetch-url' works if running via `vercel dev`
            // If running via generic Vite, this won't work locally without pointing to a deployed instance.
            // Let's fallback to specific logic or fail gracefully.
            
            const apiUrl = `/api/fetch-url?url=${encodeURIComponent(url)}`;
            
            const res = await fetch(apiUrl);
            if (!res.ok) throw new Error('Error al acceder a la URL (Proxy)');
            
            const html = await res.text();
            
            // Parse based on domain
            if (url.includes('lacuerda.net')) {
                return parseLaCuerda(html);
            } else if (url.includes('palabrayespiritu.com') || url.includes('acordes.lacuerda.net')) {
                 // Reuse LaCuerda parser for similar structures or add specific ones
                 return parseLaCuerda(html);
            } else {
                // Fallback: Try to extract title and content generically
                return parseGeneric(html);
            }

        } catch (e) {
            console.error(e);
            error.value = e.message;
            return null;
        } finally {
            loading.value = false;
        }
    }

    function parseLaCuerda(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Extract Title and Artist (Often in H1 or Title)
        // LaCuerda usually: <div id="tH1"><h1>Title <span>Artist</span></h1></div>
        let title = 'Desconocido';
        let artist = '';
        
        const h1 = doc.querySelector('div#tH1 h1');
        if (h1) {
            title = h1.childNodes[0]?.textContent?.trim() || title;
            artist = h1.querySelector('span')?.textContent?.trim() || '';
            if (artist) title += ` - ${artist}`;
        }

        // Extract Content (Pre tags usually)
        // LaCuerda: <pre id="ord_p">... content ...</pre>
        const pre = doc.querySelector('pre#ord_p') || doc.querySelector('pre');
        let raw = pre ? pre.textContent : '';

        // Cleanup LaCuerda specific junk
        raw = raw.replace(/LaCuerda\.net/g, '');
        raw = raw.replace(/Este fichero es trabajo propio.../g, '');
        raw = raw.trim();

        return {
            title,
            raw,
            original_link: '', // The user knows the link
            key: 'C', // Detection would be cool but complex. Default to C
            bpm: 0,
            time_signature: '4/4'
        };
    }

    function parseGeneric(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const title = doc.querySelector('title')?.textContent?.split('|')[0]?.trim() || 'Importada';
        
        // Try to find the biggest <pre> or a container with "lyrics" or "chords" class
        let pre = doc.querySelector('pre');
        let raw = '';
        
        if (pre) {
            raw = pre.textContent;
        } else {
            // Fallback: Get all text paragraphs? Too messy.
            // Let's try to find a div with class 'lyrics' or 'content'
            const contentDiv = doc.querySelector('.lyrics') || doc.querySelector('.content') || doc.body;
            raw = contentDiv.innerText; // Preserves newlines slightly better than textContent
        }

        return {
            title,
            raw: raw.trim(),
            key: 'C',
            bpm: 0,
            time_signature: '4/4'
        };
    }

    return {
        fetchAndParse,
        loading,
        error
    };
}
