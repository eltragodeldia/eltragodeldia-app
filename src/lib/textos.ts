import type { Idioma } from './compartido/idioma';

export const TEXTOS = {
  es: {
    pestanas: { hoy: 'Inicio', recetas: 'Recetas', mibar: 'Mi bar', guardadas: 'Guardadas', cuenta: 'Cuenta' },
    hoy: { titulo: 'El trago de hoy', preparar: 'Prepararlo', yaPuedes: 'Ya los puedes hacer', irMiBar: 'Mi bar', vacioMiBar: 'Marca en Mi bar lo que tienes en casa y aquí te digo qué puedes preparar.',
      saludo: ['Buenos días', 'Buenas tardes', 'Buenas noches'], atajos: 'Lo que puedes hacer aquí',
      a_recetas: 'Todas las recetas', a_recetasSub: (n: number) => `${n} recetas para buscar y filtrar`,
      a_mibar: '¿Qué hago con lo que tengo?', a_mibarSub: (n: number) => (n ? `${n} cosas marcadas en tu bar` : 'Marca tus botellas'),
      a_fav: 'Mis favoritas', a_favSub: (n: number) => (n ? `${n} guardadas, también sin internet` : 'Guarda las que más te gusten'),
      a_lista: 'Lista de compra', a_listaSub: (n: number) => (n ? `${n} recetas en tu lista` : 'Suma ingredientes desde una receta'),
      marcaTuBar: 'Marca lo que tienes en casa', marcaTuBarSub: 'Y te digo qué tragos ya puedes hacer y cuál botella te conviene comprar.', marcaTuBarBoton: 'Ir a Mi bar',
      porDestilado: 'Por destilado', nuevas: 'Recién llegadas', rapidas: 'En 5 minutos o menos', leer: 'Para leer', verTodos: 'Ver todos',
      bares: 'Bares que valen el viaje', baresSub: 'Mi mapa de bares y restaurantes, con lo que pedir en cada uno.', baresBoton: 'Abrir el mapa',
      colecciones: 'Colecciones', coleccionesSub: 'Las más deliciosas, para fiestas, sin alcohol y más.', coleccionesBoton: 'Ver colecciones',
      prepara: 'Prepara paso a paso', preparaSub: 'Abre cualquier receta y toca "Prepararlo paso a paso": letra grande, temporizador y la pantalla no se apaga.',
      responsable: 'Disfruta con responsabilidad. Nunca manejes si tomaste.' },
    receta: { ingredientes: 'Ingredientes', porciones: 'Porciones', pasos: 'Paso a paso', error: 'El error más común', lista: 'Añadir a mi lista de compra', enLista: 'En tu lista de compra', preparar: 'Prepararlo paso a paso', guardar: 'Guardar receta', guardada: 'Receta guardada', compartir: 'Compartir receta', volver: 'Volver', tiempo: 'Tiempo', vaso: 'Vaso', tecnica: 'Técnica', min: 'min' },
    preparar: { paso: (a: number, b: number) => `Paso ${a} de ${b}`, anterior: 'Anterior', siguiente: 'Siguiente', listo: 'Listo', salir: 'Salir del modo preparar', agitar: 'Empezar', pausar: 'Pausar', seguir: 'Seguir', segundos: 'segundos', nota: 'La pantalla no se apaga mientras preparas. El celular vibra al terminar.', fin: '¡Delicioso! Ya está listo.' },
    recetas: { titulo: 'Recetas', buscar: 'Busca un trago o un ingrediente', todos: 'Todos', ninguna: 'No encontré recetas con eso. Prueba con otra palabra.' },
    mibar: { titulo: 'Mi bar', lead: 'Marca lo que tienes en casa y te digo qué puedes preparar.', basico: 'Tengo lo básico', yaPuedes: 'Ya los puedes hacer', falta: 'Te falta solo una cosa', faltaTexto: 'Te falta:', proxima: 'Tu próxima botella', abre: 'te abre', nada: 'Todavía no puedes hacer ninguna. Marca algunas botellas.' },
    guardadas: { titulo: 'Guardadas', favoritas: 'Favoritas', lista: 'Lista de compra', sinFav: 'Todavía no guardaste ninguna receta. Abre una y toca el corazón.', sinLista: 'Tu lista está vacía. En una receta toca "Añadir a mi lista de compra".', local: 'Se guardan en este teléfono.', vaciar: 'Vaciar la lista', yaTienes: 'Ya lo tienes' },
    cuenta: { titulo: 'Cuenta', entrar: 'Entra con tu correo', entrarTexto: 'Sin contraseña: te mando un enlace al correo. Así tus favoritas, Mi bar y la lista te siguen a cualquier teléfono.', pronto: 'Las cuentas llegan en la próxima versión de prueba. Por ahora todo se guarda en este teléfono.', aviso: 'Trago del día a las 5:00 p. m.', idioma: 'Idioma', medidas: 'Medidas', privacidad: 'Privacidad', terminos: 'Términos de uso', consumo: 'Consumo responsable', version: 'Versión' },
    edad: { frase: 'Se prepara, se prueba… ¡Delicioso!', pregunta: '¿Tienes 21 años o más?', texto: 'Esta app habla de alcohol. Para entrar necesitas tener la edad legal para tomar.', si: 'Sí, tengo 21 o más', no: 'No', noTitulo: 'Te esperamos más adelante', noTexto: 'Este contenido es solo para mayores de 21 años.', legal: 'Disfruta con responsabilidad. Nunca manejes si tomaste. Al entrar aceptas los términos de uso y la política de privacidad.' },
    sinConexion: 'Sin conexión: te muestro lo último que guardé en este teléfono.',
  },
  en: {
    pestanas: { hoy: 'Home', recetas: 'Recipes', mibar: 'My bar', guardadas: 'Saved', cuenta: 'Account' },
    hoy: { titulo: "Today's drink", preparar: 'Make it', yaPuedes: 'You can make these now', irMiBar: 'My bar', vacioMiBar: 'Check what you have at home in My bar and I will tell you what you can make.',
      saludo: ['Good morning', 'Good afternoon', 'Good evening'], atajos: 'What you can do here',
      a_recetas: 'All recipes', a_recetasSub: (n: number) => `${n} recipes to search and filter`,
      a_mibar: 'What can I make?', a_mibarSub: (n: number) => (n ? `${n} things checked in your bar` : 'Check your bottles'),
      a_fav: 'My favorites', a_favSub: (n: number) => (n ? `${n} saved, also offline` : 'Save the ones you love'),
      a_lista: 'Shopping list', a_listaSub: (n: number) => (n ? `${n} recipes on your list` : 'Add ingredients from a recipe'),
      marcaTuBar: 'Check what you have at home', marcaTuBarSub: 'I will tell you which drinks you can make now and which bottle is worth buying next.', marcaTuBarBoton: 'Go to My bar',
      porDestilado: 'By spirit', nuevas: 'Just added', rapidas: 'In 5 minutes or less', leer: 'To read', verTodos: 'See all',
      bares: 'Bars worth the trip', baresSub: 'My map of bars and restaurants, with what to order at each one.', baresBoton: 'Open the map',
      colecciones: 'Collections', coleccionesSub: 'The most delicious, for parties, non-alcoholic and more.', coleccionesBoton: 'See collections',
      prepara: 'Make it step by step', preparaSub: 'Open any recipe and tap "Make it step by step": big text, a timer and the screen stays on.',
      responsable: 'Drink responsibly. Never drink and drive.' },
    receta: { ingredientes: 'Ingredients', porciones: 'Servings', pasos: 'Step by step', error: 'The most common mistake', lista: 'Add to my shopping list', enLista: 'On your shopping list', preparar: 'Make it step by step', guardar: 'Save recipe', guardada: 'Recipe saved', compartir: 'Share recipe', volver: 'Back', tiempo: 'Time', vaso: 'Glass', tecnica: 'Technique', min: 'min' },
    preparar: { paso: (a: number, b: number) => `Step ${a} of ${b}`, anterior: 'Back', siguiente: 'Next', listo: 'Done', salir: 'Leave step-by-step mode', agitar: 'Start', pausar: 'Pause', seguir: 'Resume', segundos: 'seconds', nota: 'The screen stays on while you make it. Your phone vibrates when time is up.', fin: 'Delicious! It is ready.' },
    recetas: { titulo: 'Recipes', buscar: 'Search a drink or an ingredient', todos: 'All', ninguna: 'No recipes found. Try another word.' },
    mibar: { titulo: 'My bar', lead: 'Check what you have at home and I will tell you what you can make.', basico: 'I have the basics', yaPuedes: 'You can make these now', falta: 'Just one thing missing', faltaTexto: 'Missing:', proxima: 'Your next bottle', abre: 'unlocks', nada: 'Nothing yet. Check a few bottles.' },
    guardadas: { titulo: 'Saved', favoritas: 'Favorites', lista: 'Shopping list', sinFav: 'You have not saved any recipes yet. Open one and tap the heart.', sinLista: 'Your list is empty. In a recipe, tap "Add to my shopping list".', local: 'Saved on this phone.', vaciar: 'Clear the list', yaTienes: 'You have it' },
    cuenta: { titulo: 'Account', entrar: 'Sign in with your email', entrarTexto: 'No password: I send you a link by email. Your favorites, My bar and list follow you to any phone.', pronto: 'Accounts arrive in the next test version. For now everything is saved on this phone.', aviso: 'Drink of the day at 5:00 p.m.', idioma: 'Language', medidas: 'Measurements', privacidad: 'Privacy', terminos: 'Terms of use', consumo: 'Responsible drinking', version: 'Version' },
    edad: { frase: "There's always something delicious here.", pregunta: 'Are you 21 or older?', texto: 'This app talks about alcohol. You need to be of legal drinking age to come in.', si: "Yes, I'm 21 or older", no: 'No', noTitulo: 'See you later', noTexto: 'This content is only for adults 21 and over.', legal: 'Drink responsibly. Never drink and drive. By entering you accept the terms of use and the privacy policy.' },
    sinConexion: 'Offline: showing the last copy saved on this phone.',
  },
} as const;

export type Textos = (typeof TEXTOS)[Idioma];

const DESTILADOS_EN: Record<string, string> = { Ron: 'Rum', Whisky: 'Whiskey', Licores: 'Liqueurs', 'Sin alcohol': 'Non-alcoholic', 'Fácil': 'Easy', Intermedia: 'Intermediate', Avanzada: 'Advanced' };
export const valor = (t: string, idioma: Idioma) => (idioma === 'en' ? DESTILADOS_EN[t] ?? t : t);
