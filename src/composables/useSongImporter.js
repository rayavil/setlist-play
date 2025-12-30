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
            
            // In local dev (Vite), /api/ doesn't exist. We must point to production.
            // Replace 'setlistplay.vercel.app' with your actual Vercel domain if different.
            const baseUrl = import.meta.env.DEV ? 'https://setlistplay.vercel.app' : '';
            const apiUrl = `${baseUrl}/api/fetch-url?url=${encodeURIComponent(url)}`;
            
            const res = await fetch(apiUrl);
            if (!res.ok) throw new Error('Error al acceder a la URL (Proxy)');
            
            const html = await res.text();
            
            
            // Clean up HTML before parsing? 
            // Sometimes scripts or weird tags break the DOMParser
            // But let's trust DOMParser for now.

            // Parse based on domain
            if (url.includes('lacuerda.net') || url.includes('palabrayespiritu') || url.includes('cifraclub')) {
                return parseLaCuerda(html); // Use the robust one for all common sites
            } else {
                // Fallback: Try to extract title and content generically
                return parseLaCuerda(html); // Actually, the robust parser is better than 'parseGeneric'
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

        // Extract Title and Artist
        // Try User's suggestion: H1 (Title) and H2 (Artist)
        let title = 'Desconocido';
        let artist = '';

        const h1 = doc.querySelector('h1');
        if(h1) title = h1.textContent.trim();

        const h2 = doc.querySelector('h2');
        if(h2) artist = h2.textContent.trim();

        // Fallback to old selector if H1 is empty or generic
        if (!title || title === 'LaCuerda.net') {
             const h1Old = doc.querySelector('div#tH1 h1');
             if (h1Old) {
                title = h1Old.childNodes[0]?.textContent?.trim() || title;
                artist = h1Old.querySelector('span')?.textContent?.trim() || artist;
             }
        }

        if (artist && !title.includes(artist)) title += ` - ${artist}`;

        // Extract Content (Pre tags usually)
        // LaCuerda: <pre id="ord_p">... content ...</pre>
        // Best Candidate Selection
        // User suggested 'div#t_body'
        const candidates = [
            doc.querySelector('div#t_body'),
            doc.querySelector('pre#ord_p'),
            doc.querySelector('div#t_core'),
            doc.querySelector('.core'),
            doc.querySelector('#main_body') 
        ];

        let contentEl = candidates.find(el => el && el.textContent.length > 50);

        // Fallback: Find the element with most text that preserves whitespace
        if (!contentEl) {
             const allPres = Array.from(doc.querySelectorAll('pre, div'));
             contentEl = allPres.reduce((best, el) => {
                 const len = el.textContent.length;
                 // Penalize elements with too much HTML (links, etc) if needed, but for now length is good proxy
                 // Just avoid huge navigation menus
                 if (len > (best?.len || 0) && len < 10000) {
                     return { el, len };
                 }
                 return best;
             }, null)?.el;
        }

        let raw = contentEl ? contentEl.innerText : ''; // innerText handles <br> better than textContent

        // Cleanup LaCuerda specific junk
        raw = raw.replace(/LaCuerda\.net/g, '');
        raw = raw.replace(/Este fichero es trabajo propio.../g, '');
        raw = raw.trim();

        const formatted = convertChordsToBracketed(raw);

        // Key Detection
        // User: <div id="butHrm4"><em class="small">C»Do</em></div>
        let key = 'C';
        const keyEl = doc.querySelector('.butCmd em') || doc.querySelector('div[id^="butHrm"] em');
        if (keyEl) {
            const text = keyEl.textContent; // "C»Do"
            const parts = text.split('»');
            if (parts.length > 0) {
                 key = parts[0].trim();
            }
        }

        return {
            title,
            raw: formatted,
            original_link: '', 
            key, 
            bpm: 0,
            time_signature: '4/4'
        };
    }

    function convertChordsToBracketed(text) {
        if (!text) return '';
        const lines = text.split('\n');
        const result = [];
        
        const isChordLine = (line) => {
            if (!line.trim()) return false;
            // Simple check: line has only valid chord chars and lots of spaces
            // Valid chars: A-G, #, b, m, 7, 9, sus, dim, aug, /, digits, (, )
            // And mostly spaces.
            
            const trimmed = line.trim();
            // Split by spaces to check individual "tokens"
            const tokens = trimmed.split(/\s+/);
            const validChordRegex = /^[A-G](?:#|b)?(?:m|maj|min|dim|aug|sus|add|M)?\d*(?:\/[A-G](?:#|b)?)?\(?\)?$/;
            
            // If ALL tokens look like chords, it's likely a chord line
            const allChords = tokens.every(t => validChordRegex.test(t.replace(/[()]/g, ''))); // loose check
            
            // Also check density (chords usually have gaps)
            // But LaCuerda sometimes packs them. 
            // Better heuristic: "Is mostly spaces" OR "Tokens are all chords"
            return allChords;
        };

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const nextLine = lines[i + 1];

            if (isChordLine(line) && nextLine && !isChordLine(nextLine) && nextLine.trim().length > 0) {
                // Merge!
                let merged = "";
                let offset = 0;
                let lastIdx = 0;
                
                // Find chords in the line with their indices
                const chordMatches = [];
                const regex = /([A-G][^\s]*)/g;
                let match;
                while ((match = regex.exec(line)) !== null) {
                    chordMatches.push({
                        chord: match[0],
                        index: match.index
                    });
                }
                
                let currentLyricIdx = 0;
                
                // Construct merged line
                for (const item of chordMatches) {
                    // Append lyrics up to this chord
                    if (item.index > currentLyricIdx) {
                       merged += nextLine.substring(currentLyricIdx, item.index);
                       currentLyricIdx = item.index;
                    }
                    
                    // If lyric line is shorter than chord position, pad with spaces?
                    // Or just append.
                    if (currentLyricIdx >= nextLine.length) {
                       // We are past the lyrics, just append space + chord
                       merged += " ".repeat(item.index - Math.max(currentLyricIdx, nextLine.length));
                    }
                    
                    merged += '[' + item.chord + ']';
                }
                
                // Append remaining lyrics
                if (currentLyricIdx < nextLine.length) {
                    merged += nextLine.substring(currentLyricIdx);
                }
                
                result.push(merged);
                i++; // Skip next line as we consumed it
            } else {
                result.push(line);
            }
        }
        
        return result.join('\n');
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
