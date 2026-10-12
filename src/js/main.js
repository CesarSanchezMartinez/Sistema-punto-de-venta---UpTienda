console.log("Cesar Sanchez Martinez 24598 4C");

// Protección de ruta: Si no hay sesión activa y no estamos en login, redirigir al login
if (!localStorage.getItem('uptienda_user') && !window.location.pathname.includes('login.html')) {
  window.location.href = 'login.html';
}

// Load Tauri dialog API dynamically: prefer local package, fall back to CDN for dev without bundler
(async () => {
  let ask;
  try {
    const mod = await import('@tauri-apps/api/dialog');
    ask = mod.ask;
  } catch (e) {
    // Fallback to CDN if local import fails (useful during simple serve without bundler)
    try {
      const mod = await import('https://cdn.jsdelivr.net/npm/@tauri-apps/api@1.5.0/dialog/dist/index.js');
      ask = mod.ask;
    } catch (err) {
      // If both fail, provide a simple fallback that uses window.confirm
      ask = async (message) => confirm(message);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    // Selección del botón/card de cerrar sesión
    const logoutCard = document.getElementById('logoutCard');

    const askLogout = async () => {
      try {
        const resp = await ask('¿Deseas cerrar la sesión y volver al login?', {
          title: 'Confirmar cierre de sesión',
          type: 'warning'
        });
        return resp === true;
      } catch (err) {
        return confirm('¿Deseas cerrar la sesión y volver al login?');
      }
    };

    if (logoutCard) {
      logoutCard.addEventListener('click', async (e) => {
        e.preventDefault();
        const target = logoutCard.getAttribute('href') || 'login.html';
        const confirmed = await askLogout();
        if (confirmed) {
          localStorage.removeItem('uptienda_user'); // Limpiar sesión al cerrar
          window.location.href = target;
        }
      });
    }

    // Atajos de teclado Alt+1..Alt+4 para navegación rápida
    window.addEventListener('keydown', (ev) => {
      if (!ev.altKey) return;
      switch (ev.key) {
        case '1': window.location.href = 'ventas.html'; break;
        case '2': window.location.href = 'inventario.html'; break;
        case '3': window.location.href = 'finanzas.html'; break;
        case '4': 
          localStorage.removeItem('uptienda_user');
          window.location.href = 'login.html'; 
          break;
        default: return;
      }
    });
  });
})();

// Función global para enviar el correo de recuperación mediante EmailJS
function enviarCorreoRecuperacion(correoDestino, codigoGenerado) {
    const templateParams = {
        to_email: correoDestino,
        email: correoDestino,
        pass_code: codigoGenerado
    };

    emailjs.send('service_efij1ul', 'template_rwwtvcv', templateParams)
        .then(function(response) {
            console.log('Correo enviado exitosamente!', response.status, response.text);
            alert('¡Código de verificación enviado a tu correo!');
        }, function(error) {
            console.error('Error al enviar el correo:', error);
            alert('Hubo un error al enviar el correo. Inténtalo de nuevo.');
        });
}

// Función global para enviar el correo de bienvenida mediante EmailJS
function enviarCorreoBienvenida(correoDestino, nombreUsuario) {
    const templateParams = {
        to_email: correoDestino,
        user_name: nombreUsuario,
        login_url: window.location.origin + '/login.html'
    };

    emailjs.send('service_efij1ul', 'template_xaba6qe', templateParams)
        .then(function(response) {
            console.log('Correo de bienvenida enviado exitosamente!', response.status, response.text);
        }, function(error) {
            console.error('Error al enviar el correo de bienvenida:', error);
        });
}