# 📧 Plantillas de Email para Supabase - SetList Play

Copia cada plantilla y pégala en **Supabase Dashboard → Authentication → Email Templates**

---

## 1. Confirmar Email (Confirm signup)

**Subject:** 🎵 ¡Confirma tu cuenta en SetList Play!

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body
    style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;"
  >
    <table
      width="100%"
      cellpadding="0"
      cellspacing="0"
      style="background-color: #0a0a0a; padding: 40px 20px;"
    >
      <tr>
        <td align="center">
          <table
            width="100%"
            style="max-width: 500px; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; overflow: hidden; border: 1px solid #2d2d44;"
          >
            <!-- Header -->
            <tr>
              <td style="padding: 32px 32px 24px; text-align: center;">
                <div style="font-size: 40px; margin-bottom: 8px;">🎵</div>
                <h1
                  style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;"
                >
                  SetList Play
                </h1>
                <p style="color: #8b8b9a; margin: 8px 0 0; font-size: 14px;">
                  Tu compañero musical
                </p>
              </td>
            </tr>
            <!-- Content -->
            <tr>
              <td style="padding: 0 32px 32px;">
                <div
                  style="background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 12px; padding: 24px; text-align: center;"
                >
                  <h2
                    style="color: #ffffff; margin: 0 0 12px; font-size: 20px;"
                  >
                    ¡Bienvenido! 🎉
                  </h2>
                  <p
                    style="color: #a1a1aa; margin: 0 0 24px; font-size: 15px; line-height: 1.6;"
                  >
                    Solo falta un paso para que puedas organizar tus setlists
                    como un profesional.
                  </p>
                  <a
                    href="{{ .ConfirmationURL }}"
                    style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;"
                  >
                    Confirmar mi cuenta
                  </a>
                </div>
                <p
                  style="color: #52525b; font-size: 12px; text-align: center; margin: 24px 0 0;"
                >
                  Si no creaste esta cuenta, puedes ignorar este correo.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
```

---

## 2. Resetear Contraseña (Reset password)

**Subject:** 🔐 Recupera tu acceso a SetList Play

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body
    style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;"
  >
    <table
      width="100%"
      cellpadding="0"
      cellspacing="0"
      style="background-color: #0a0a0a; padding: 40px 20px;"
    >
      <tr>
        <td align="center">
          <table
            width="100%"
            style="max-width: 500px; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; overflow: hidden; border: 1px solid #2d2d44;"
          >
            <!-- Header -->
            <tr>
              <td style="padding: 32px 32px 24px; text-align: center;">
                <div style="font-size: 40px; margin-bottom: 8px;">🔐</div>
                <h1
                  style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;"
                >
                  SetList Play
                </h1>
              </td>
            </tr>
            <!-- Content -->
            <tr>
              <td style="padding: 0 32px 32px;">
                <div
                  style="background: rgba(234, 179, 8, 0.1); border: 1px solid rgba(234, 179, 8, 0.3); border-radius: 12px; padding: 24px; text-align: center;"
                >
                  <h2
                    style="color: #ffffff; margin: 0 0 12px; font-size: 20px;"
                  >
                    ¿Olvidaste tu contraseña?
                  </h2>
                  <p
                    style="color: #a1a1aa; margin: 0 0 24px; font-size: 15px; line-height: 1.6;"
                  >
                    No te preocupes, nos pasa a todos. 😅<br />
                    Haz clic abajo para crear una nueva.
                  </p>
                  <a
                    href="{{ .ConfirmationURL }}"
                    style="display: inline-block; background: linear-gradient(135deg, #eab308 0%, #f59e0b 100%); color: #000000; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;"
                  >
                    Cambiar contraseña
                  </a>
                </div>
                <p
                  style="color: #52525b; font-size: 12px; text-align: center; margin: 24px 0 0;"
                >
                  Este link expira en 1 hora. Si no solicitaste esto, ignora el
                  correo.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
```

---

## 3. Magic Link (Si lo usas)

**Subject:** 🚀 Tu acceso a SetList Play

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body
    style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;"
  >
    <table
      width="100%"
      cellpadding="0"
      cellspacing="0"
      style="background-color: #0a0a0a; padding: 40px 20px;"
    >
      <tr>
        <td align="center">
          <table
            width="100%"
            style="max-width: 500px; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; overflow: hidden; border: 1px solid #2d2d44;"
          >
            <!-- Header -->
            <tr>
              <td style="padding: 32px 32px 24px; text-align: center;">
                <div style="font-size: 40px; margin-bottom: 8px;">🚀</div>
                <h1
                  style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;"
                >
                  SetList Play
                </h1>
              </td>
            </tr>
            <!-- Content -->
            <tr>
              <td style="padding: 0 32px 32px;">
                <div
                  style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px; padding: 24px; text-align: center;"
                >
                  <h2
                    style="color: #ffffff; margin: 0 0 12px; font-size: 20px;"
                  >
                    ¡Acceso instantáneo!
                  </h2>
                  <p
                    style="color: #a1a1aa; margin: 0 0 24px; font-size: 15px; line-height: 1.6;"
                  >
                    Haz clic para entrar a tu cuenta sin contraseña.
                  </p>
                  <a
                    href="{{ .ConfirmationURL }}"
                    style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;"
                  >
                    Entrar ahora
                  </a>
                </div>
                <p
                  style="color: #52525b; font-size: 12px; text-align: center; margin: 24px 0 0;"
                >
                  Este link expira en 1 hora y solo funciona una vez.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
```

---

## 📝 Instrucciones

1. Ve a **Supabase Dashboard** → tu proyecto
2. **Authentication** → **Email Templates**
3. Selecciona cada tipo de email
4. Copia el **Subject** y pégalo en el campo de asunto
5. Copia el **HTML** y pégalo en el contenido
6. Guarda cada uno

¡Listo! Tus usuarios recibirán correos bonitos 🎨
