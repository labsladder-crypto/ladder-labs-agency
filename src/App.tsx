/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring } from "motion/react";
import {
  Instagram,
  Mail,
  ChevronRight,
  Music,
  Zap,
  Globe,
  Activity,
  ArrowRight,
  Cloud,
  X,
  ExternalLink,
  Youtube
} from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import EventRadar from "./components/EventRadar";
import StudioBackground from "./components/StudioBackground";

// --- Translations ---
type Language = "EN" | "PT" | "ES";

const translations = {
  EN: {
    nav: { artists: "Artists", about: "About", booking: "Booking", bookNow: "Book Now" },
    hero: {
      title1: "WE BUILD STAGES.",
      title2: "WE MOVE FREQUENCIES.",
      subtitle: "Ladder Labs represents the next generation of electronic music artists. Architects of immersive dancefloor experiences.",
      cta1: "Explore Artists",
      cta2: "Book an Artist",
      scroll: "Scroll to explore"
    },
    about: {
      title1: "ARCHITECTS OF",
      title2: "UNDERGROUND ENERGY",
      p1: "Ladder Labs isn't just an agency; we are curators of sound. We bridge the gap between cutting-edge production and high-impact live performance.",
      p2: "Our mission is to represent powerful stage-driven artists with strong identity and sonic depth. We believe in the transformative power of the dancefloor.",
      stat1: "Elite Artists",
      stat2: "Global Bookings"
    },
    roster: {
      tag: "The Roster",
      title: "OUR ARTISTS",
      subtitle: "Representing the most influential names in the underground circuit.",
      book: "Book Artist",
      showing: "Showing",
      clear: "Clear Filter",
      energy: "Energy Level"
    },
    genres: {
      title1: "GENRES",
      title2: "WE MOVE",
      house: "The heartbeat of the club. From minimal grooves to tech-house precision.",
      techno: "Industrial strength and warehouse energy. Raw, powerful, and uncompromising.",
      psytrance: "Immersive psychedelic journeys. High-speed storytelling for the cosmic dancefloor.",
      progressive: "Emotional build-ups and deep melodic structures. The sound of the sunrise.",
      darkpsy: "Forest textures and night-time intensity. Exploring the deepest shadows of sound."
    },
    booking: {
      title: "REQUEST BOOKING",
      subtitle: "Secure the sound for your next event. Our team will respond within 24 hours.",
      name: "Full Name",
      company: "Company / Event",
      location: "Location",
      date: "Event Date",
      budget: "Orçamento Estimado (BRL)",
      message: "Message",
      cta: "REQUEST BOOKING",
      submitting: "TRANSMITTING...",
      successTitle: "TRANSMISSION RECEIVED",
      successMsg: "Your booking request has been sent to our curators.",
      another: "Send another request"
    },
    footer: {
      desc: "Architects of Immersive Sound",
      copy: "© 2026 LADDER LABS AGENCY",
      rights: "ALL FREQUENCIES RESERVED"
    },
    bios: {
      "EVVE": "EVVE is a master of the minimal groove, blending deep tech house textures with surgical precision. Known for hypnotic sets that keep the floor locked in a constant state of motion.",
      "PAJÔ": "PAJÔ bridges the gap between progressive melodies and powerful psytrance rhythms. His storytelling approach to the dancefloor creates immersive journeys that transcend time and space.",
      "NRZ": "NRZ delivers high-energy progressive beats infused with psychedelic elements. A staple in the festival circuit, his sound is characterized by driving basslines and ethereal atmospheres.",
      "MOLUSKO": "MOLUSKO is at the forefront of the Hi-Tech movement, pushing the boundaries of speed and sound design. His sets are a masterclass in sonic complexity and relentless energy.",
      "JUREMA": "JUREMA explores the deepest shadows of the forest, weaving organic textures with dark psychedelic patterns. A true shaman of the night-time dancefloor.",
      "PRADIM": "PRADIM brings a sophisticated touch to the tech house scene. His minimal approach emphasizes groove and timing, making him a favorite for intimate club settings and sunrise sets.",
      "SESI'OHM": "SESI'OHM is a force of nature on the psytrance stage. Blending classic elements with modern production, his sound is a powerful tribute to the spirit of the psychedelic dancefloor.",
      "DASH": "DASH delivers pure, unadulterated psytrance energy. Known for his dynamic performances and infectious stage presence, he creates a direct connection with the audience through sound.",
      "UKACZ": "UKACZ brings the raw energy of the UK underground to the global stage. Blending garage swings with house foundations, his sets are a celebration of rhythm and bass.",
      "JUNNO": "JUNNO is a specialist in heavy basslines and infectious house grooves. His signature sound blends the grit of bass house with the soul of garage, creating high-impact dancefloor moments.",
      "RISAFFI": "RISAFFI is a purveyor of high-quality tech house. His sets are characterized by driving percussion and deep, rolling basslines that keep the energy high from start to finish.",
      "PIMENTA": "PIMENTA delivers the explosive energy of Full On psytrance. His sets are a journey through high-speed rhythms and uplifting melodies, designed for peak-time festival moments.",
      "LEROCK'S": "LEROCK'S creates cinematic soundscapes within the melodic techno realm. His music is a balance of emotional depth and warehouse power, taking listeners on a profound sonic voyage.",
      "BÁRBARA THOMAZ": "BÁRBARA THOMAZ is a rising star in melodic techno. Her sets are characterized by elegant transitions and a deep understanding of atmosphere, creating a sophisticated club experience.",
      "JUNIOR SANT": "JUNIOR SANT blends industrial techno foundations with melodic sensibilities. His sound is powerful yet emotive, perfect for both dark warehouses and open-air festivals.",
      "ELOAH": "ELOAH is a master of the tech house groove. Her sets are a seamless blend of minimal precision and high-energy house, designed to keep the dancefloor moving all night long.",
      "LACER": "LACER delivers driving tech house with a focus on percussion and energy. His sets are high-impact and relentless, making him a staple of the modern club circuit.",
      "UMBRA": "UMBRA explores the darker side of melodic techno. His sound is characterized by deep basslines and haunting melodies, creating an immersive and introspective dancefloor experience.",
      "IZZI": "IZZI brings a unique blend of indie dance and acid house to the roster. Her sets are eclectic and high-energy, full of unexpected twists and infectious rhythms.",
      "BET'S": "BET'S is a specialist in minimal tech house. Her approach is all about the subtle details and the perfect groove, creating a hypnotic experience that captivates the floor.",
      "GENÊ": "GENÊ is the latest addition to the Ladder Labs family, bringing a fresh perspective on House and Indie Dance. Blending classic house foundations with modern indie sensibilities, his sound is both nostalgic and forward-thinking.",
      "IDEMAX": "IDEMAX is a powerhouse of Full On psytrance. His productions are known for their massive energy, crystal-clear sound design, and infectious melodies that dominate the largest festival stages.",
      "CAMPELLO": "CAMPELLO delivers a high-octane Full On experience. With a focus on driving basslines and psychedelic storytelling, his sets are a journey through the peak moments of the trance experience.",
      "DAMATA": "DAMATA is a master of the Forest sound. Weaving organic textures with deep, hypnotic rhythms, he creates a sonic atmosphere that transports listeners to the heart of the ancient woods.",
      "DOTA": "DOTA specializes in the emotional depth of Progressive psytrance. His music is characterized by beautiful build-ups, melodic complexity, and a groove that resonates with the soul.",
      "KORDIE": "KORDIE brings a fresh energy to the Tech House scene. His sets are a blend of punchy drums and catchy hooks, designed to keep the energy high and the dancefloor packed.",
      "PITT MALIC": "PITT MALIC explores the intersection of Techno and Psychedelia. His Psytechno sets are dark, driving, and full of mind-bending textures that challenge the boundaries of conventional techno.",
      "PEDRO TAB": "PEDRO TAB is a specialist in Peak Time Techno. His sound is relentless, powerful, and uncompromising, designed for the most intense moments of the night in the world's best warehouses.",
      "WAVEMOON": "WAVEMOON delivers a cosmic psytrance experience. His music is a blend of high-speed storytelling and celestial atmospheres, taking the dancefloor on a journey through the stars.",
      "NEXUS": "NEXUS is a master architect of Progressive psytrance. His music takes listeners on a deep emotional journey, with layered melodies and powerful grooves that build slowly toward transcendent peak moments.",
      "BAZZE": "BAZZE is a rising talent, bringing a fresh perspective to the dancefloor with an infectious groove and deep atmosphere."
    },
    radar: {
      tag: "Strategic Intelligence",
      title: "EVENT RADAR",
      emptyState: "No events mapped — start by clicking the map",
      mappedEvents: (count: number) => `${count} event${count !== 1 ? 's' : ''} mapped`,
      cancel: "Cancel",
      add: "Add Event",
      viewList: (count: number) => `View list (${count})`,
      exportJson: "Export JSON",
      eventDetails: "Event Details",
      eventName: "Event Name",
      orgName: "Organization (Org)",
      city: "City",
      stateLabel: "State",
      dateLabel: "Date",
      instagramLabel: "Instagram",
      genresLabel: "Genres",
      notesLabel: "Notes (Optional)",
      saveBtn: "Save Event",
      deleteEvent: "Delete Event",
      deleteConfirm1: "Are you sure you want to delete",
      deleteConfirm2: "This action cannot be undone.",
      cancelDelete: "Cancel",
      confirmDelete: "Yes, delete",
      mappedSoFar: "Mapped Events"
    }
  },
  PT: {
    nav: { artists: "Artistas", about: "Sobre", booking: "Booking", bookNow: "Reservar" },
    hero: {
      title1: "CONSTRUÍMOS PALCOS.",
      title2: "MOVEMOS FREQUÊNCIAS.",
      subtitle: "Ladder Labs representa a próxima geração de artistas de música eletrônica. Arquitetos de experiências imersivas na pista.",
      cta1: "Explorar Artistas",
      cta2: "Reservar Artista",
      scroll: "Role para explorar"
    },
    about: {
      title1: "ARQUITETOS DE",
      title2: "ENERGIA UNDERGROUND",
      p1: "Ladder Labs não é apenas uma agência; somos curadores de som. Unimos a produção de ponta com performances ao vivo de alto impacto.",
      p2: "Nossa missão é representar artistas poderosos com identidade forte e profundidade sonora. Acreditamos no poder transformador da pista de dança.",
      stat1: "Artistas de Elite",
      stat2: "Bookings Globais"
    },
    roster: {
      tag: "O Roster",
      title: "NOSSOS ARTISTAS",
      subtitle: "Representando os nomes mais influentes do circuito underground.",
      book: "Reservar Artista",
      showing: "Exibindo",
      clear: "Limpar Filtro",
      energy: "Nível de Energia"
    },
    genres: {
      title1: "GÊNEROS",
      title2: "QUE MOVEMOS",
      house: "O pulsar do clube. De grooves minimalistas à precisão do tech-house.",
      techno: "Força industrial e energia de galpão. Cru, poderoso e sem concessões.",
      psytrance: "Jornadas psicodélicas imersivas. Narrativas de alta velocidade para a pista cósmica.",
      progressive: "Build-ups emocionais e estruturas melódicas profundas. O som do amanhecer.",
      darkpsy: "Texturas de floresta e intensidade noturna. Explorando as sombras mais profundas do som."
    },
    booking: {
      title: "SOLICITAR BOOKING",
      subtitle: "Garanta o som para o seu próximo evento. Nossa equipe responderá em 24 horas.",
      name: "Nome Completo",
      company: "Empresa / Evento",
      location: "Localização",
      date: "Data do Evento",
      budget: "Orçamento Estimado (BRL)",
      message: "Mensagem",
      cta: "SOLICITAR BOOKING",
      submitting: "TRANSMITINDO...",
      successTitle: "TRANSMISSÃO RECEBIDA",
      successMsg: "Sua solicitação de reserva foi enviada aos nossos curadores.",
      another: "Enviar outra solicitação"
    },
    footer: {
      desc: "Arquitetos do Som Imersivo",
      copy: "© 2026 LADDER LABS AGENCY",
      rights: "TODOS OS DIREITOS RESERVADOS"
    },
    bios: {
      "EVVE": "EVVE é mestre no groove minimalista, unindo texturas profundas do tech house com precisão cirúrgica. Conhecido por sets hipnóticos que mantêm a pista em constante estado de movimento.",
      "PAJÔ": "PAJÔ preenche a lacuna entre melodias progressivas e ritmos poderosos do psytrance. Sua abordagem narrativa cria jornadas imersivas na pista que transcendem o tempo e o espaço.",
      "NRZ": "NRZ entrega batidas progressivas de alta energia infundidas com elementos psicodélicos. Presença marcante no circuito de festivais com linhas de baixo imponentes e atmosferas etéreas.",
      "MOLUSKO": "MOLUSKO está na vanguarda do movimento Hi-Tech, expandindo os limites da velocidade e do sound design. Seus sets são uma aula magna de complexidade sonora e energia implacável.",
      "JUREMA": "JUREMA explora as sombras mais profundas da floresta, tecendo texturas orgânicas com padrões psicodélicos obscuros. Um verdadeiro xamã da pista de dança noturna.",
      "PRADIM": "PRADIM traz um toque sofisticado para a cena tech house. Sua abordagem minimalista enfatiza o groove e o tempo, tornando-o favorito para ambientes íntimos de clube e sets ao amanhecer.",
      "SESI'OHM": "SESI'OHM é uma força da natureza no palco psytrance. Misturando elementos clássicos com produção moderna, seu som é um tributo poderoso ao espírito da pista de dança psicodélica.",
      "DASH": "DASH entrega pura energia psytrance não adulterada. Conhecido por suas performances dinâmicas e presença de palco contagiante, ele cria uma conexão direta com o público através do som.",
      "UKACZ": "UKACZ traz a energia crua do underground do Reino Unido para o palco global. Misturando o balanço do garage com fundações house, seus sets são uma celebração do ritmo e do baixo.",
      "JUNNO": "JUNNO é um especialista em linhas de baixo pesadas e grooves de house contagiantes. Sua assinatura sonora mistura o peso do bass house com a alma do garage, criando momentos de alto impacto na pista.",
      "RISAFFI": "RISAFFI é um fornecedor de tech house de alta qualidade. Seus sets são caracterizados por percussão intensa e basslines profundos e envolventes que mantêm a energia alta do início ao fim.",
      "PIMENTA": "PIMENTA entrega a energia explosiva do Full On psytrance. Seus sets são uma jornada por ritmos de alta velocidade e melodias edificantes, projetados para momentos de pico em festivais.",
      "LEROCK'S": "LEROCK'S cria paisagens sonoras cinemáticas dentro do reino do melodic techno. Sua música é um equilíbrio entre profundidade emocional e poder de galpão, levando os ouvintes a uma viagem sonora profunda.",
      "BÁRBARA THOMAZ": "BÁRBARA THOMAZ é uma estrela em ascensão no melodic techno. Seus sets são caracterizados por transições elegantes e uma profunda compreensão da atmosfera, criando uma experiência de clube sofisticada.",
      "JUNIOR SANT": "JUNIOR SANT mistura fundações industriais de techno com sensibilidades melódicas. Seu som é poderoso e emotivo, perfeito tanto para galpões escuros quanto para festivais a céu aberto.",
      "ELOAH": "ELOAH é uma mestre do groove do tech house. Seus sets são uma mistura perfeita de precisão minimalista e house de alta energia, projetados para manter a pista de dança se movendo a noite toda.",
      "LACER": "LACER entrega um tech house vibrante com foco em percussão e energia. Seus sets são de alto impacto e implacáveis, tornando-o peça fundamental do circuito de clubes modernos.",
      "UMBRA": "UMBRA explora o lado mais sombrio do melodic techno. Seu som é caracterizado por linhas de baixo profundas e melodias fantasmagóricas, criando uma experiência de pista de dança imersiva e introspectiva.",
      "IZZI": "IZZI traz uma mistura única de indie dance e acid house para o roster. Seus sets são ecléticos e de alta energia, cheios de reviravoltas inesperadas e ritmos contagiantes.",
      "BET'S": "BET'S é especialista em tech house minimalista. Sua abordagem é sobre os detalhes sutis e o groove perfeito, criando uma experiência hipnótica que cativa a pista.",
      "GENÊ": "GENÊ é a mais recente adição à família Ladder Labs, trazendo uma nova perspectiva sobre House e Indie Dance. Misturando as fundações clássicas do house com sensibilidades modernas do indie, seu som é nostálgico e visionário.",
      "IDEMAX": "IDEMAX é uma potência do Full On psytrance. Suas produções são conhecidas pela energia massiva, sound design cristalino e melodias contagiantes que dominam os maiores palcos de festivais.",
      "CAMPELLO": "CAMPELLO oferece uma experiência Full On de alta octanagem. Com foco em linhas de baixo vigorosas e narrativa psicodélica, seus sets são uma jornada pelos momentos de pico da experiência trance.",
      "DAMATA": "DAMATA é um mestre do som Forest. Tecendo texturas orgânicas com ritmos profundos e hipnóticos, ele cria uma atmosfera sonora que transporta os ouvintes para o coração da floresta ancestral.",
      "DOTA": "DOTA é especializado na profundidade emocional do Progressive psytrance. Sua música é caracterizada por belos build-ups, complexidade melódica e um groove que ressoa com a alma.",
      "KORDIE": "KORDIE traz uma nova energia para a cena Tech House. Seus sets são uma mistura de baterias marcantes e ganchos cativantes, projetados para manter a energia alta e a pista lotada.",
      "PITT MALIC": "PITT MALIC explora a intersecção do Techno e da Psicodelia. Seus sets de Psytechno são sombrios, envolventes e cheios de texturas alucinantes que desafiam as fronteiras do techno convencional.",
      "PEDRO TAB": "PEDRO TAB é especialista em Peak Time Techno. Seu som é implacável, poderoso e sem concessões, desenhado para os momentos mais intensos da noite nos melhores galpões do mundo.",
      "WAVEMOON": "WAVEMOON proporciona uma experiência de psytrance cósmico. Sua música é uma mistura de narrativa em alta velocidade e atmosferas celestiais, levando a pista de dança a uma jornada pelas estrelas.",
      "NEXUS": "NEXUS é um arquiteto mestre do Progressive psytrance. Sua música conduz os ouvintes a uma profunda jornada emocional, com melodias em camadas e grooves poderosos que crescem lentamente rumo a picos transcendentes.",
      "BAZZE": "BAZZE é um talento em ascensão, trazendo uma nova perspectiva para a pista de dança com um groove contagiante e atmosfera profunda."
    },
    radar: {
      tag: "Inteligência Estratégica",
      title: "EVENT RADAR",
      emptyState: "Nenhum evento mapeado — comece clicando no mapa",
      mappedEvents: (count: number) => `${count} evento${count !== 1 ? 's' : ''} mapeado${count !== 1 ? 's' : ''}`,
      cancel: "Cancelar",
      add: "Adicionar Evento",
      viewList: (count: number) => `Ver lista (${count})`,
      exportJson: "Exportar JSON",
      eventDetails: "Detalhes do Evento",
      eventName: "Nome do Evento",
      orgName: "Organização (Núcleo/Produtora)",
      city: "Cidade",
      stateLabel: "Estado (UF)",
      dateLabel: "Data",
      instagramLabel: "Instagram",
      genresLabel: "Vertentes (Gêneros)",
      notesLabel: "Observações",
      saveBtn: "Salvar Evento no Radar",
      deleteEvent: "Excluir Evento",
      deleteConfirm1: "Tem certeza que deseja excluir",
      deleteConfirm2: "Esta ação não pode ser desfeita.",
      cancelDelete: "Cancelar",
      confirmDelete: "Sim, excluir",
      mappedSoFar: "Eventos Mapeados"
    }
  },
  ES: {
    nav: { artists: "Artistas", about: "Sobre", booking: "Booking", bookNow: "Reservar" },
    hero: {
      title1: "CONSTRUIMOS ESCENARIOS.",
      title2: "MOVEMOS FRECUENCIAS.",
      subtitle: "Ladder Labs representa la próxima generación de artistas de música electrónica. Arquitectos de experiencias inmersivas en la pista.",
      cta1: "Explorar Artistas",
      cta2: "Reservar Artista",
      scroll: "Desliza para explorar"
    },
    about: {
      title1: "ARQUITECTOS DE",
      title2: "ENERGÍA UNDERGROUND",
      p1: "Ladder Labs no es solo una agencia; somos curadores de sonido. Unimos la producción de vanguardia con actuaciones en vivo de alto impacto.",
      p2: "Nuestra misión es representar artistas poderosos con una identidad fuerte y profundidad sonora. Creemos en el poder transformador de la pista de baile.",
      stat1: "Artistas de Élite",
      stat2: "Bookings Globales"
    },
    roster: {
      tag: "El Roster",
      title: "NUESTROS ARTISTAS",
      subtitle: "Representando los nombres más influyentes del circuito underground.",
      book: "Reservar Artista",
      showing: "Mostrando",
      clear: "Limpiar Filtro",
      energy: "Nivel de Energía"
    },
    genres: {
      title1: "GÉNEROS",
      title2: "QUE MOVEMOS",
      house: "El latido del club. Desde grooves minimalistas hasta la precisión del tech-house.",
      techno: "Fuerza industrial y energía de almacén. Crudo, potente y sin compromisos.",
      psytrance: "Viajes psicodélicos inmersivos. Narrativas de alta velocidad para la pista cósmica.",
      progressive: "Build-ups emocionales y estructuras melódicas profundas. El sonido del amanecer.",
      darkpsy: "Texturas de bosque e intensidad nocturna. Explorando las sombras más profundas del sonido."
    },
    booking: {
      title: "SOLICITAR RESERVA",
      subtitle: "Asegura el sonido para tu próximo evento. Nuestro equipo responderá en 24 horas.",
      name: "Nombre Completo",
      company: "Empresa / Evento",
      location: "Ubicación",
      date: "Fecha del Evento",
      budget: "Presupuesto Estimado (BRL)",
      message: "Mensaje",
      cta: "SOLICITAR RESERVA",
      submitting: "TRANSMITIENDO...",
      successTitle: "TRANSMISIÓN RECIBIDA",
      successMsg: "Tu solicitud de reserva ha sido enviada a nuestros curadores.",
      another: "Enviar otra solicitud"
    },
    footer: {
      desc: "Arquitectos del Sonido Inmersivo",
      copy: "© 2026 LADDER LABS AGENCY",
      rights: "TODOS LOS DERECHOS RESERVADOS"
    },
    bios: {
      "EVVE": "EVVE es maestro del groove minimalista, fusionando texturas profundas del tech house con precisión quirúrgica. Conocido por sets hipnóticos que mantienen la pista en un estado constante de movimiento.",
      "PAJÔ": "PAJÔ puentea la brecha entre melodías progresivas y potentes ritmos psytrance. Su enfoque narrativo para la pista de baile crea viajes inmersivos que trascienden el tiempo y el espacio.",
      "NRZ": "NRZ ofrece ritmos progresivos de alta energía infundidos con elementos psicodélicos. Un pilar en el circuito de festivales, su sonido se caracteriza por líneas de bajo conductoras y atmósferas etéreas.",
      "MOLUSKO": "MOLUSKO está a la vanguardia del movimiento Hi-Tech, empujando los límites de la velocidad y el diseño sonoro. Sus sets son una clase magistral de complejidad sonora y energía implacable.",
      "JUREMA": "JUREMA explora las sombras más profundas del bosque, tejiendo texturas orgánicas con oscuros patrones psicodélicos. Un verdadero chamán de la pista de baile nocturna.",
      "PRADIM": "PRADIM aporta un toque sofisticado a la escena tech house. Su enfoque minimalista enfatiza el groove y el tiempo, haciéndolo el favorito para entornos íntimos de club y sets al amanecer.",
      "SESI'OHM": "SESI'OHM es una fuerza de la naturaleza en el escenario psytrance. Mezclando elementos clásicos con producción moderna, su sonido es un poderoso tributo al espíritu de la pista de baile psicodélica.",
      "DASH": "DASH ofrece pura energía psytrance sin adulterar. Conocido por sus actuaciones dinámicas y presencia escénica contagiosa, crea una conexión directa con el público a través del sonido.",
      "UKACZ": "UKACZ trae la energía cruda del underground británico al escenario global. Mezclando oscilaciones de garage con bases house, sus sets son una celebración del ritmo y el bajo.",
      "JUNNO": "JUNNO es especialista en líneas de bajo pesadas y ritmos house contagiosos. Su sonido característico mezcla la rudeza del bass house con el alma del garage, creando momentos de alto impacto en la pista.",
      "RISAFFI": "RISAFFI es un proveedor de tech house de alta calidad. Sus sets se caracterizan por una percusión contundente y líneas de bajo profundas y envolventes que mantienen la energía a tope de principio a fin.",
      "PIMENTA": "PIMENTA ofrece la energía explosiva del Full On psytrance. Sus sets son un viaje a través de ritmos de alta velocidad y melodías inspiradoras, diseñados para los momentos pico de los festivales.",
      "LEROCK'S": "LEROCK'S crea paisajes sonoros cinematográficos dentro del reino del melodic techno. Su música es un equilibrio entre profundidad emocional y poder de almacén, llevando a los oyentes a un profundo viaje sonoro.",
      "BÁRBARA THOMAZ": "BÁRBARA THOMAZ es una estrella en ascenso en el melodic techno. Sus sets se caracterizan por transiciones elegantes y una profunda comprensión de la atmósfera, creando una experiencia de club sofisticada.",
      "JUNIOR SANT": "JUNIOR SANT mezcla bases industriales de techno con sensibilidades melódicas. Su sonido es poderoso pero emotivo, perfecto tanto para almacenes oscuros como para festivales al aire libre.",
      "ELOAH": "ELOAH es maestra del groove del tech house. Sus sets son una mezcla perfecta de precisión minimalista y house de alta energía, diseñados para mantener la pista de baile en movimiento toda la noche.",
      "LACER": "LACER ofrece un tech house contundente con enfoque en la percusión y la energía. Sus sets son de alto impacto e implacables, convirtiéndolo en un elemento básico del circuito de clubes moderno.",
      "UMBRA": "UMBRA explora el lado más oscuro del melodic techno. Su sonido se caracteriza por líneas de bajo profundas y melodías inquietantes, creando una experiencia inmersiva e introspectiva en la pista de baile.",
      "IZZI": "IZZI aporta una mezcla única de indie dance y acid house al roster. Sus sets son eclécticos y de alta energía, llenos de giros inesperados y ritmos contagiosos.",
      "BET'S": "BET'S es especialista en tech house minimalista. Su enfoque se trata de los detalles sutiles y el groove perfecto, creando una experiencia hipnótica que cautiva la pista.",
      "GENÊ": "GENÊ es la última incorporación a la familia Ladder Labs, aportando una nueva perspectiva al House y al Indie Dance. Mezclando las bases clásicas del house con las modernas sensibilidades del indie, su sonido es a la vez nostálgico y vanguardista.",
      "IDEMAX": "IDEMAX es una potencia del Full On psytrance. Sus producciones son conocidas por su energía masiva, diseño sonoro cristalino y melodías contagiosas que dominan los escenarios más grandes de los festivales.",
      "CAMPELLO": "CAMPELLO ofrece una experiencia Full On de alto octanaje. Con un enfoque en líneas de bajo contundentes y narrativas psicodélicas, sus sets son un viaje por los momentos álgidos de la experiencia trance.",
      "DAMATA": "DAMATA es un maestro del sonido Forest. Tejiendo texturas orgánicas con ritmos profundos e hipnóticos, crea una atmósfera sonora que transporta a los oyentes al corazón de los bosques ancestrales.",
      "DOTA": "DOTA se especializa en la profundidad emocional del Progressive psytrance. Su música se caracteriza por hermosos build-ups, complejidad melódica y un groove que resuena con el alma.",
      "KORDIE": "KORDIE trae nueva energía a la escena Tech House. Sus sets son una mezcla de baterías contundentes y ganchos pegajosos, diseñados para mantener la energía al máximo y la pista de baile llena.",
      "PITT MALIC": "PITT MALIC explora la intersección entre el Techno y la Psicodelia. Sus sets de Psytechno son oscuros, contundentes y llenos de texturas alucinantes que desafían los límites del techno convencional.",
      "PEDRO TAB": "PEDRO TAB es especialista en Peak Time Techno. Su sonido es implacable, poderoso y sin concesiones, diseñado para los momentos más intensos de la noche en los mejores almacenes del mundo.",
      "WAVEMOON": "WAVEMOON ofrece una experiencia de psytrance cósmico. Su música es una mezcla de narración a alta velocidad y atmósferas celestiales, llevando a la pista de baile a un viaje a través de las estrellas.",
      "NEXUS": "NEXUS es un maestro arquitecto del Progressive psytrance. Su música lleva a los oyentes en un profundo viaje emocional, con melodías en capas y potentes grooves que construyen lentamente hacia momentos cumbre trascendentes.",
      "BAZZE": "BAZZE es un talento emergente, aportando una nueva perspectiva a la pista de baile con un groove contagioso y una atmósfera profunda."
    },
    radar: {
      tag: "Inteligencia Estratégica",
      title: "EVENT RADAR",
      emptyState: "Ningún evento mapeado — empieza haciendo clic en el mapa",
      mappedEvents: (count: number) => `${count} evento${count !== 1 ? 's' : ''} mapeado${count !== 1 ? 's' : ''}`,
      cancel: "Cancelar",
      add: "Agregar Evento",
      viewList: (count: number) => `Ver lista (${count})`,
      exportJson: "Exportar JSON",
      eventDetails: "Detalles del Evento",
      eventName: "Nombre del Evento",
      orgName: "Organización",
      city: "Ciudad",
      stateLabel: "Estado",
      dateLabel: "Fecha",
      instagramLabel: "Instagram",
      genresLabel: "Géneros",
      notesLabel: "Notas",
      saveBtn: "Guardar Evento",
      deleteEvent: "Eliminar Evento",
      deleteConfirm1: "¿Estás seguro de que quieres eliminar",
      deleteConfirm2: "Esta acción no se puede deshacer.",
      cancelDelete: "Cancelar",
      confirmDelete: "Sí, eliminar",
      mappedSoFar: "Eventos Mapeados"
    }
  }
};

// --- Artist Data ---
const allArtists = [
  {
    name: "EVVE",
    genre: "Tech House / Minimal",
    genreKey: "house",
    image: "/artists/Evve.jpg",
    socials: { instagram: "https://www.instagram.com/evvemusic/", soundcloud: "https://soundcloud.com/evvemusic/tracks", spotify: "#", youtube: "https://www.youtube.com/@evvemusicc/videos" },
    presskit: "https://drive.google.com/drive/u/2/folders/1W8RXPDREOskOMV6HEal5g5Qz4qfDAigf",
    bio: "EVVE is a master of the minimal groove, blending deep tech house textures with surgical precision. Known for hypnotic sets that keep the floor locked in a constant state of motion."
  },
  {
    name: "PAJÔ",
    genre: "Psytrance / Progressive",
    genreKey: "psytrance",
    image: "/artists/Pajo.png",
    socials: { instagram: "https://www.instagram.com/pajo.art.br/", soundcloud: "https://soundcloud.com/pajomusic", spotify: "https://open.spotify.com/intl-pt/artist/6adnFJLRZFxvSJ5vhLnyqX", youtube: "https://www.youtube.com/@pajosounds/videos" },
    presskit: "https://drive.google.com/drive/u/5/folders/12xNjFc75ePb73baAqqlwCC6SF5tPROyw",
    bio: "PAJÔ bridges the gap between progressive melodies and powerful psytrance rhythms. His storytelling approach to the dancefloor creates immersive journeys that transcend time and space."
  },
  {
    name: "NRZ",
    genre: "Progressive / Psytrance",
    genreKey: "psytrance",
    image: "/artists/NRZ.jpeg",
    socials: { instagram: "https://www.instagram.com/nrzproject_/", soundcloud: "https://soundcloud.com/nrzproject/tracks", spotify: "#", youtube: "#" },
    presskit: "https://drive.google.com/drive/folders/0B-e2Ns8v7KEJYlVPUmpSanlKLTg?resourcekey=0-YsdRYsLNnKmAOyHzlR2Xww",
    bio: "NRZ delivers high-energy progressive beats infused with psychedelic elements. A staple in the festival circuit, his sound is characterized by driving basslines and ethereal atmospheres."
  },
  {
    name: "MOLUSKO",
    genre: "Hi Tech",
    genreKey: "psytrance",
    image: "/artists/Molusko.png",
    socials: { instagram: "https://www.instagram.com/moluskodj/", soundcloud: "https://soundcloud.com/djmolusko", spotify: "#", youtube: "#" },
    presskit: "https://drive.google.com/drive/folders/1YrvTqSXVb9yBgfZLehI2LkPu5cBqBtfl",
    bio: "MOLUSKO is at the forefront of the Hi-Tech movement, pushing the boundaries of speed and sound design. His sets are a masterclass in sonic complexity and relentless energy."
  },
  {
    name: "JUREMA",
    genre: "Dark Psy / Forest",
    genreKey: "darkpsy",
    image: "/artists/Jurema.jpg",
    socials: { instagram: "https://www.instagram.com/djjurema/", soundcloud: "https://soundcloud.com/djurema", spotify: "#", youtube: "https://www.youtube.com/@djjurema/videos" },
    presskit: "https://drive.google.com/drive/folders/1ODUa7OCUSNoZTFk2-fku0w7gOWWd8HIJ",
    bio: "JUREMA explores the deepest shadows of the forest, weaving organic textures with dark psychedelic patterns. A true shaman of the night-time dancefloor."
  },
  {
    name: "PRADIM",
    genre: "Tech House / Minimal",
    genreKey: "house",
    image: "/artists/Pradim.jpeg",
    socials: { instagram: "https://www.instagram.com/pradim__/", soundcloud: "https://soundcloud.com/felipe-prado-zrm", spotify: "https://open.spotify.com/intl-pt/artist/2ufH7FrNeF629uC3bZGLB5", youtube: "https://www.youtube.com/@Pradim_Music" },
    presskit: "https://www.canva.com/design/DAHCTtv3hZg/Q1gkedgmMJmeTVK_Ukl43w/view",
    bio: "PRADIM brings a sophisticated touch to the tech house scene. His minimal approach emphasizes groove and timing, making him a favorite for intimate club settings and sunrise sets."
  },
  {
    name: "SESI'OHM",
    genre: "Psytrance",
    genreKey: "psytrance",
    image: "/artists/Sesi'Ohm.jpg",
    socials: { instagram: "https://www.instagram.com/sesiohmm/", soundcloud: "https://soundcloud.com/sesiohmm", spotify: "#", youtube: "https://www.youtube.com/@sesiohmlive5103" },
    presskit: "https://drive.google.com/drive/u/0/folders/18ip2967Z0RGHFft46aeo7xV98pYTCSdY",
    bio: "SESI'OHM is a force of nature on the psytrance stage. Blending classic elements with modern production, his sound is a powerful tribute to the spirit of the psychedelic dancefloor."
  },
  {
    name: "DASH",
    genre: "Psytrance",
    genreKey: "psytrance",
    image: "/artists/Dash.jpeg",
    socials: { instagram: "https://www.instagram.com/dash.music_/", soundcloud: "#", spotify: "#", youtube: "#" },
    presskit: "https://drive.google.com/drive/u/0/folders/18ip2967Z0RGHFft46aeo7xV98pYTCSdY",
    bio: "DASH delivers pure, unadulterated psytrance energy. Known for his dynamic performances and infectious stage presence, he creates a direct connection with the audience through sound."
  },
  {
    name: "UKACZ",
    genre: "House / UK Garage",
    genreKey: "house",
    image: "/artists/Ukacz.png",
    socials: { instagram: "https://www.instagram.com/ukacz.music/", soundcloud: "https://soundcloud.com/ukaczmusic", spotify: "#", youtube: "#" },
    presskit: "https://drive.google.com/drive/folders/1o_Ts4kdJmOHYLyXeEbHToEOIjFnBGAV-",
    bio: "UKACZ brings the raw energy of the UK underground to the global stage. Blending garage swings with house foundations, his sets are a celebration of rhythm and bass."
  },
  {
    name: "JUNNO",
    genre: "Bass House / Garage House",
    genreKey: "house",
    image: "/artists/Junno.jpg",
    socials: { instagram: "https://www.instagram.com/junnomusic/", soundcloud: "https://soundcloud.com/junnomusic", spotify: "https://open.spotify.com/intl-pt/artist/2kfy2Ut2nR7GW0l2E2wxef", youtube: "https://www.youtube.com/@junnomusicdj/videos" },
    presskit: "https://junnomusic.com.br/",
    bio: "JUNNO is a specialist in heavy basslines and infectious house grooves. His signature sound blends the grit of bass house with the soul of garage, creating high-impact dancefloor moments."
  },
  {
    name: "RISAFFI",
    genre: "Tech House",
    genreKey: "house",
    image: "/artists/Risaffi.jpeg",
    socials: { instagram: "https://www.instagram.com/_risaffi/", soundcloud: "#", spotify: "https://open.spotify.com/intl-pt/artist/52MPLEEOjiJgYyF84X8qyZ", youtube: "#" },
    presskit: "#",
    bio: "RISAFFI is a purveyor of high-quality tech house. His sets are characterized by driving percussion and deep, rolling basslines that keep the energy high from start to finish."
  },
  {
    name: "PIMENTA",
    genre: "Psytrance / Full On",
    genreKey: "psytrance",
    image: "/artists/Pimenta.jpeg",
    socials: { instagram: "#", soundcloud: "#", spotify: "#" },
    presskit: "#",
    bio: "PIMENTA delivers the explosive energy of Full On psytrance. His sets are a journey through high-speed rhythms and uplifting melodies, designed for peak-time festival moments."
  },
  {
    name: "LEROCK'S",
    genre: "Melodic Techno",
    genreKey: "techno",
    image: "/artists/Lerocks.png",
    socials: { instagram: "https://www.instagram.com/lerocksdj", soundcloud: "#", spotify: "https://open.spotify.com/intl-pt/artist/4ismQ738W44jaS75QdoMyQ?si=IW1yA5nmSc6OiHvuli3n6Q&nd=1&dlsi=257c965860174ae6", youtube: "https://www.youtube.com/@Lerockdj/videos" },
    presskit: "https://lerocks.com.br/",
    bio: "LEROCK'S creates cinematic soundscapes within the melodic techno realm. His music is a balance of emotional depth and warehouse power, taking listeners on a profound sonic voyage."
  },
  {
    name: "BÁRBARA THOMAZ",
    genre: "Melodic Techno",
    genreKey: "techno",
    image: "/artists/Bathomaz.png",
    socials: { instagram: "https://www.instagram.com/bathomaz?utm_source=ig_web_button_share_sheet&igsh=MTkxZDZiYWxrNHdoZA%3D%3D", soundcloud: "https://soundcloud.com/dj-barbara-thomaz", spotify: "#", youtube: "https://www.youtube.com/channel/UC15enO2mcWiVxrmDQAjMnCQ" },
    presskit: "https://bathomaz.com.br/",
    bio: "BÁRBARA THOMAZ is a rising star in melodic techno. Her sets are characterized by elegant transitions and a deep understanding of atmosphere, creating a sophisticated club experience."
  },
  {
    name: "JUNIOR SANT",
    genre: "Melodic Techno",
    genreKey: "techno",
    image: "/artists/Junior Sant.jpeg",
    socials: { instagram: "https://www.instagram.com/juniorsant_oficial/", soundcloud: "https://soundcloud.com/junior-sant-979249143", spotify: "https://open.spotify.com/user/31pqfmvj2tekcsqr5nckmu2mgtja?si=c7d8d31b85684879&nd=1&dlsi=ca3fe2d41d904563", youtube: "https://www.youtube.com/@djjuniorsant/videos" },
    presskit: "#",
    bio: "JUNIOR SANT blends industrial techno foundations with melodic sensibilities. His sound is powerful yet emotive, perfect for both dark warehouses and open-air festivals."
  },
  {
    name: "ELOAH",
    genre: "Tech House / Minimal",
    genreKey: "house",
    image: "/artists/Eloah.jpeg",
    socials: { instagram: "https://www.instagram.com/eloahprieto/", soundcloud: "https://soundcloud.com/eloah-prieto/tracks", spotify: "#", youtube: "#" },
    presskit: "#",
    bio: "ELOAH is a master of the tech house groove. Her sets are a seamless blend of minimal precision and high-energy house, designed to keep the dancefloor moving all night long."
  },
  {
    name: "LACER",
    genre: "Tech House",
    genreKey: "house",
    image: "/artists/Lacer.png",
    socials: { instagram: "https://www.instagram.com/lacermusic/", soundcloud: "#", spotify: "https://open.spotify.com/intl-pt/artist/3c3SUbSwAni69Rae4Y16Eq?si=LmEcl2qpQW2BwpkGPimGYw&nd=1&dlsi=e1d81544dd9f4147", youtube: "https://www.youtube.com/@LacerMusicBR/videos" },
    presskit: "https://presskitpro.app/lacer/",
    bio: "LACER delivers driving tech house with a focus on percussion and energy. His sets are high-impact and relentless, making him a staple of the modern club circuit."
  },
  {
    name: "UMBRA",
    genre: "Melodic Techno",
    genreKey: "techno",
    image: "/artists/Umbra.jpeg",
    socials: { instagram: "https://www.instagram.com/umbramusicdj?utm_source=ig_web_button_share_sheet&igsh=MXZ2bm4wMW9iczExNg%3D%3D", soundcloud: "https://soundcloud.com/um-bra-792980200?utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing", spotify: "https://open.spotify.com/user/31p64ytpp6zyeimazaiefp4b26pi", youtube: "#" },
    presskit: "#",
    bio: "UMBRA explores the darker side of melodic techno. His sound is characterized by deep basslines and haunting melodies, creating an immersive and introspective dancefloor experience."
  },
  {
    name: "IZZI",
    genre: "Indie Dance / Acid House",
    genreKey: "house",
    image: "/artists/Izzi.png",
    socials: { instagram: "https://www.instagram.com/izzibeatmaker/", soundcloud: "#", spotify: "#", youtube: "#" },
    presskit: "#",
    bio: "IZZI brings a unique blend of indie dance and acid house to the roster. Her sets are eclectic and high-energy, full of unexpected twists and infectious rhythms."
  },
  {
    name: "BET'S",
    genre: "Tech House / Minimal",
    genreKey: "house",
    image: "/artists/Bets.jpeg",
    socials: { instagram: "https://www.instagram.com/humbertohct/", soundcloud: "#", spotify: "#", youtube: "#" },
    presskit: "#",
    bio: "BET'S is a specialist in minimal tech house. Her approach is all about the subtle details and the perfect groove, creating a hypnotic experience that captivates the floor."
  },
  {
    name: "GENÊ",
    genre: "House / Indie Dance",
    genreKey: "house",
    image: "/artists/GENÊ.png",
    socials: { instagram: "https://www.instagram.com/gabrielgene_/", soundcloud: "https://soundcloud.com/gabriel-gene/tracks", spotify: "#", youtube: "#" },
    presskit: "#",
    bio: "GENÊ is the latest addition to the Ladder Labs family, bringing a fresh perspective on House and Indie Dance. Blending classic house foundations with modern indie sensibilities, his sound is both nostalgic and forward-thinking."
  },
  {
    name: "IDEMAX",
    genre: "Full On",
    genreKey: "psytrance",
    image: "/artists/Idemax.jpg",
    socials: { instagram: "https://www.instagram.com/idemax/", soundcloud: "https://soundcloud.com/idemax", spotify: "https://open.spotify.com/intl-pt/artist/6jp5aN5ze1ysiSJh61oMCx", youtube: "https://www.youtube.com/channel/UCsyBTwoIMSABNe_UQ54XNQA" },
    presskit: "https://www.idemax.net/",
    bio: "IDEMAX is a powerhouse of Full On psytrance. His productions are known for their massive energy, crystal-clear sound design, and infectious melodies that dominate the largest festival stages."
  },
  {
    name: "CAMPELLO",
    genre: "Full On",
    genreKey: "psytrance",
    image: "/artists/Campello.jpg",
    socials: { instagram: "https://www.instagram.com/camp3llo_live/", soundcloud: "https://soundcloud.com/andre-campello-1655472", spotify: "https://open.spotify.com/intl-pt/artist/1hvS5nKXwPxi7FZCG2vzrk?si=xWVj237UQJW8Tk3rh3dklQ&nd=1&dlsi=f26288b435b94442", youtube: "https://www.youtube.com/channel/UC5yFCDz-pchH_jm-rujgHjA" },
    presskit: "https://drive.google.com/drive/folders/1pLGzFQfsB5ZOXIZ8wZVGyT2DQilPQ7Fi",
    bio: "CAMPELLO delivers a high-octane Full On experience. With a focus on driving basslines and psychedelic storytelling, his sets are a journey through the peak moments of the trance experience."
  },
  {
    name: "DAMATA",
    genre: "Forest",
    genreKey: "psytrance",
    image: "/artists/Damata.png",
    socials: { instagram: "https://www.instagram.com/damata_music/", soundcloud: "https://audius.co/damatamusic", spotify: "#", youtube: "#" },
    presskit: "https://drive.google.com/drive/folders/1oVQqclwtEZHTlQOSYXx9e0mQKYrpoB-L",
    bio: "DAMATA is a master of the Forest sound. Weaving organic textures with deep, hypnotic rhythms, he creates a sonic atmosphere that transports listeners to the heart of the ancient woods."
  },
  {
    name: "DOTA",
    genre: "Progressive",
    genreKey: "progressive",
    image: "/artists/Dota.jpg",
    socials: { instagram: "https://www.instagram.com/_djdota/", soundcloud: "#", spotify: "#", youtube: "#" },
    presskit: "#",
    bio: "DOTA specializes in the emotional depth of Progressive psytrance. His music is characterized by beautiful build-ups, melodic complexity, and a groove that resonates with the soul."
  },
  {
    name: "KORDIE",
    genre: "Tech House",
    genreKey: "house",
    image: "/artists/Kordie.jpeg",
    socials: { instagram: "#", soundcloud: "#", spotify: "#" },
    presskit: "#",
    bio: "KORDIE brings a fresh energy to the Tech House scene. His sets are a blend of punchy drums and catchy hooks, designed to keep the energy high and the dancefloor packed."
  },
  {
    name: "PITT MALIC",
    genre: "Psytechno",
    genreKey: "techno",
    image: "/artists/Pitt Malic.jpeg",
    socials: { instagram: "https://www.instagram.com/djpittmalic/", soundcloud: "#", spotify: "#", youtube: "#" },
    presskit: "#",
    bio: "PITT MALIC explores the intersection of Techno and Psychedelia. His Psytechno sets are dark, driving, and full of mind-bending textures that challenge the boundaries of conventional techno."
  },
  {
    name: "PEDRO TAB",
    genre: "Techno / Peak Time",
    genreKey: "techno",
    image: "/artists/Tab.png",
    socials: { instagram: "https://www.instagram.com/pedrotabsounds/", soundcloud: "https://soundcloud.com/pedrotab/tracks", spotify: "#", youtube: "#" },
    presskit: "#",
    bio: "PEDRO TAB is a specialist in Peak Time Techno. His sound is relentless, powerful, and uncompromising, designed for the most intense moments of the night in the world's best warehouses."
  },
  {
    name: "WAVEMOON",
    genre: "Psytrance",
    genreKey: "psytrance",
    image: "/artists/Wavemoon.jpeg",
    socials: { instagram: "https://www.instagram.com/wavemoonoficial/", soundcloud: "https://soundcloud.com/wavemoonlive/popular-tracks", spotify: "#", youtube: "#" },
    presskit: "#",
    bio: "WAVEMOON delivers a cosmic psytrance experience. His music is a blend of high-speed storytelling and celestial atmospheres, taking the dancefloor on a journey through the stars."
  },
  {
    name: "NEXUS",
    genre: "Progressive",
    genreKey: "progressive",
    image: "/artists/Nexus.jpeg",
    socials: { instagram: "https://www.instagram.com/nexus_dj__/", soundcloud: "https://soundcloud.com/matheus-has14/tracks", spotify: "https://open.spotify.com/intl-pt/artist/62lrgPgbORAV5jI6zOZ2wS?si=GZ2cFs7aTvK0NXPKkC6i-g&utm_source=ig&utm_medium=social&utm_content=link_in_bio&fbclid=PAZXh0bgNhZW0CMTEAc3J0YwZhcHBfaWQMMjU2MjgxMDQwNTU4AAGn4QutYs8Ij2Kcr-H7VOCPtngVkML0GRNK0M3FKK9N52OyiKp89nBXStGoiLA_aem_Pvm399AismO4TJoLkeWk9g&nd=1&dlsi=e850983bae1a45b4", youtube: "#" },
    presskit: "#",
    bio: "NEXUS is a master architect of Progressive psytrance. His music takes listeners on a deep emotional journey, with layered melodies and powerful grooves that build slowly toward transcendent peak moments."
  },
  {
    name: "BAZZE",
    genre: "House / Tech House",
    genreKey: "house",
    image: "/artists/Default.png",
    socials: { instagram: "https://www.instagram.com/bazze.art/", soundcloud: "#", spotify: "#", youtube: "#" },
    presskit: "#",
    bio: "BAZZE is a rising talent, bringing a fresh perspective to the dancefloor with an infectious groove and deep atmosphere."
  }
];

// --- Components ---

const AmbientBackground = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const blob1X = useSpring(useTransform(mouseX, [0, window.innerWidth], [-50, 50]), { stiffness: 50, damping: 30 });
  const blob1Y = useSpring(useTransform(mouseY, [0, window.innerHeight], [-50, 50]), { stiffness: 50, damping: 30 });
  const blob2X = useSpring(useTransform(mouseX, [0, window.innerWidth], [50, -50]), { stiffness: 50, damping: 30 });
  const blob2Y = useSpring(useTransform(mouseY, [0, window.innerHeight], [50, -50]), { stiffness: 50, damping: 30 });

  const blob3X = useSpring(useTransform(mouseX, [0, window.innerWidth], [-100, 100]), { stiffness: 30, damping: 40 });
  const blob3Y = useSpring(useTransform(mouseY, [0, window.innerHeight], [100, -100]), { stiffness: 30, damping: 40 });

  return (
    <div className="bg-mesh overflow-hidden">
      <motion.div
        style={{ x: blob1X, y: blob1Y }}
        className="mesh-blob mesh-blob-1 opacity-20"
      />
      <motion.div
        style={{ x: blob2X, y: blob2Y }}
        className="mesh-blob mesh-blob-2 opacity-20"
      />
      <motion.div
        style={{ x: blob3X, y: blob3Y }}
        className="mesh-blob bg-brand-pink/20 blur-[120px] w-[500px] h-[500px] absolute -top-20 -left-20"
      />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-5 pointer-events-none" />
      <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none mix-blend-overlay" />
    </div>
  );
};

const HUDCorners = () => (
  <>
    <div className="hud-corner hud-tl" />
    <div className="hud-corner hud-tr" />
    <div className="hud-corner hud-bl" />
    <div className="hud-corner hud-br" />
  </>
);

const AncestralDivider = () => (
  <div className="divider-ancestral">
    <div className="divider-line" />
    <span className="divider-symbol">◉</span>
    <div className="divider-line" />
  </div>
);

export default function App() {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem("ladder_labs_lang");
    return (saved as Language) || "EN";
  });
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [activeArtist, setActiveArtist] = useState<typeof allArtists[0] | null>(null);
  const [statusIndex, setStatusIndex] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [prefilledArtist, setPrefilledArtist] = useState("");

  const statusMessages = [
    "3 ARTISTS TOURING",
    "NEXT SHOW: SÃO PAULO",
    "INTERNATIONAL BOOKING OPEN",
    "FREQUENCY ACTIVE"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % statusMessages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const t = translations[lang];
  const artistsRef = useRef<HTMLElement>(null);

  useEffect(() => {
    localStorage.setItem("ladder_labs_lang", lang);
  }, [lang]);

  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  const filteredArtists = allArtists
    .filter(artist => artist.image !== "")
    .filter(artist => !selectedGenre || artist.genreKey === selectedGenre);

  const genreCountMap = allArtists.reduce((acc, a) => {
    acc[a.genreKey] = (acc[a.genreKey] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleGenreClick = (genreKey: string) => {
    const newGenre = genreKey === selectedGenre ? null : genreKey;
    setSelectedGenre(newGenre);

    // Subtle background shift
    const colors: Record<string, string> = {
      house: "#0B1015",
      techno: "#100B15",
      psytrance: "#0B1512",
      progressive: "#15120B",
      darkpsy: "#0F0B15"
    };
    document.body.style.setProperty("--bg-shift", newGenre ? colors[newGenre] : "#0B0B0F");

    if (artistsRef.current) {
      artistsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormStatus("submitting");

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const subject = `Booking Request: ${data.name} - ${data.company}`;
    const body = `
Name: ${data.name}
Company/Event: ${data.company}
Location: ${data.location}
Date: ${data.date}
Budget: ${data.budget}

Message:
${data.message}
    `.trim();

    const mailtoUrl = `mailto:labs.ladder@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    setTimeout(() => {
      window.location.href = mailtoUrl;
      setFormStatus("success");
    }, 1000);
  };

  return (
    <div className="min-h-screen selection:bg-brand-cyan/30 overflow-x-hidden">
      <StudioBackground />

      {/* Navigation */}
      <header>
        <nav className={`fixed top-0 w-full z-50 px-4 md:px-6 flex justify-between items-center transition-all duration-500 ${scrolled ? "glass-panel border-b border-white/10 py-3 shadow-[0_8px_40px_rgba(0,0,0,0.6)]" : "bg-transparent border-b border-transparent py-5"}`}>
          <div className="flex items-center gap-3 md:gap-4">
            <div className="flex items-center gap-2">
              <motion.div
                whileHover={{ rotate: 135 }}
                className="w-7 h-7 md:w-8 md:h-8 bg-gradient-to-br from-brand-cyan to-brand-pink rounded-sm rotate-45 flex items-center justify-center cursor-pointer"
              >
                <div className="w-3 md:w-4 h-0.5 bg-white -rotate-45" />
              </motion.div>
              <span className="font-display font-bold text-lg md:text-xl tracking-tighter">
                LADDER<span className="text-gradient">LABS</span>
              </span>
            </div>
            <div className="h-6 w-px bg-white/10 hidden sm:block" />
            <div className="hidden sm:flex flex-col leading-none">
              <span className="text-[7px] uppercase tracking-widest text-white/40 font-bold">Partner</span>
              <span className="text-[9px] font-display font-bold tracking-tighter text-white/80">NEVERLAND</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-8">
            <div className="flex gap-8 text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">
              <a href="#genres" className="hover:text-brand-cyan transition-colors">Genres</a>
              <a href="#artists" className="hover:text-brand-cyan transition-colors">{t.nav.artists}</a>
              <a href="#radar" className="hover:text-brand-cyan transition-colors">Radar</a>
              <a href="#about" className="hover:text-brand-cyan transition-colors">{t.nav.about}</a>
              <a href="#booking" className="hover:text-brand-cyan transition-colors">{t.nav.booking}</a>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2 text-[9px] font-bold tracking-widest text-brand-cyan/60">
              <div className="status-dot" />
              <div className="status-ticker w-40">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={statusIndex}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    className="absolute inset-0 flex items-center"
                  >
                    {statusMessages[statusIndex]}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <div className="lang-toggle">
              {(["EN", "PT", "ES"] as Language[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`lang-item ${lang === l ? "active" : ""}`}
                >
                  {l}
                </button>
              ))}
            </div>
            <a
              href="#booking"
              className="hidden sm:block px-5 py-2 bg-white text-brand-dark text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-brand-cyan transition-all btn-glow"
            >
              {t.nav.bookNow}
            </a>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative h-svh flex items-center justify-center text-center px-6 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=2070"
              alt="Psytrance Festival"
              className="w-full h-full object-cover opacity-20 scale-110"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-brand-dark/70" />
          </div>
          <motion.div
            style={{ opacity: heroOpacity, scale: heroScale }}
            className="max-w-5xl relative z-10"
          >
            {/* Metallic Logos */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-24 mb-12 md:mb-20"
            >
              <img
                src="/logos/neverland-records.webp"
                alt="Neverland Records"
                className="h-12 md:h-20 w-auto logo-metallic"
                referrerPolicy="no-referrer"
              />
              <img
                src="/logos/ladder-labs.png"
                alt="Ladder Labs"
                className="h-24 md:h-44 w-auto logo-metallic"
                referrerPolicy="no-referrer"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-3 mb-6"
            >
              <span className="text-brand-cyan/40 text-[10px]">✦</span>
              <span className="text-brand-cyan text-[10px] font-bold uppercase tracking-[0.5em]">
                International Artist Agency
              </span>
              <span className="text-brand-cyan/40 text-[10px]">✦</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display font-bold leading-[0.9] mb-8 tracking-tighter"
            >
              {t.hero.title1}<br />
              <span className="text-gradient">{t.hero.title2}</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-white/50 max-w-2xl mx-auto mb-12 font-light leading-relaxed"
            >
              {t.hero.subtitle}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <a href="#genres" className="px-10 py-5 bg-white text-brand-dark font-bold uppercase tracking-widest rounded-full hover:bg-brand-cyan transition-all hover:scale-105 btn-glow flex items-center justify-center gap-2">
                <span className="text-[10px]">✦</span> {t.hero.cta1}
              </a>
              <a href="#booking" className="px-10 py-5 border border-white/20 text-white font-bold uppercase tracking-widest rounded-full hover:bg-white/5 transition-all flex justify-center">
                {t.hero.cta2}
              </a>
            </motion.div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
          >
            <span className="text-[9px] uppercase tracking-[0.4em] text-white/30">{t.hero.scroll}</span>
            <div className="w-px h-10 bg-gradient-to-b from-brand-cyan to-transparent" />
          </motion.div>
        </section>

        <AncestralDivider />

        {/* Genres Section */}
        <section id="genres" className="py-24 md:py-32 relative overflow-hidden">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16 md:mb-24"
            >
              <h2 className="font-display font-bold tracking-tighter mb-4">
                {t.genres.title1} <span className="text-gradient">{t.genres.title2}</span>
              </h2>
              <p className="text-white/30 text-[10px] uppercase tracking-[0.4em] font-bold">Select a frequency to filter</p>
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                onClick={() => setSelectedGenre(null)}
                className={`glass-panel p-6 md:p-8 rounded-3xl text-center group cursor-pointer transition-all relative ${selectedGenre === null ? "border-brand-cyan/50 ui-glow" : "hover:border-brand-cyan/20"
                  }`}
              >
                <HUDCorners />
                <div className={`w-10 h-10 md:w-12 md:h-12 mx-auto mb-4 md:mb-6 rounded-2xl bg-white/5 flex items-center justify-center transition-colors ${selectedGenre === null ? "bg-brand-cyan/20" : "group-hover:bg-brand-cyan/10"
                  }`}>
                  <Activity className={selectedGenre === null ? "text-white" : "text-brand-cyan"} size={20} />
                </div>
                <h4 className="font-display text-sm md:text-base font-bold tracking-tight uppercase">All Roster</h4>
                <span className="text-[9px] text-white/30 font-bold mt-1 block">{allArtists.filter(a => a.image !== "").length} artists</span>
              </motion.div>

              {[
                { key: "house", name: "House", icon: Music, text: t.genres.house },
                { key: "techno", name: "Techno", icon: Zap, text: t.genres.techno },
                { key: "psytrance", name: "Psytrance", icon: Activity, text: t.genres.psytrance },
                { key: "progressive", name: "Progressive", icon: Globe, text: t.genres.progressive },
                { key: "darkpsy", name: "Dark Psy", icon: ChevronRight, text: t.genres.darkpsy }
              ].map((genre, idx) => (
                <motion.div
                  key={genre.key}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => handleGenreClick(genre.key)}
                  className={`glass-panel p-6 md:p-8 rounded-3xl text-center group cursor-pointer transition-all relative ${selectedGenre === genre.key ? "border-brand-cyan/50 ui-glow" :
                    selectedGenre ? "opacity-40 grayscale" : "hover:border-brand-cyan/20"
                    }`}
                >
                  <HUDCorners />
                  <div className={`w-10 h-10 md:w-12 md:h-12 mx-auto mb-4 md:mb-6 rounded-2xl bg-white/5 flex items-center justify-center transition-colors ${selectedGenre === genre.key ? "bg-brand-cyan/20" : "group-hover:bg-brand-cyan/10"
                    }`}>
                    <genre.icon className={selectedGenre === genre.key ? "text-white" : "text-brand-cyan"} size={20} />
                  </div>
                  <h4 className="font-display text-sm md:text-base font-bold tracking-tight uppercase">{genre.name}</h4>
                  <span className="text-[9px] text-white/30 font-bold mt-1 block">{genreCountMap[genre.key] || 0} artists</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <AncestralDivider />

        {/* Roster Section */}
        <section id="artists" ref={artistsRef} className="py-24 md:py-32 bg-black/20">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 md:mb-20 gap-8">
              <div className="max-w-xl">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-brand-cyan text-[10px] font-bold uppercase tracking-[0.5em] block">{t.roster.tag}</span>
                  <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                    <span className="text-[8px] font-bold uppercase tracking-widest text-white/50">
                      Showing {filteredArtists.length} of {allArtists.filter(a => a.image !== "").length} Artists
                    </span>
                  </div>
                </div>
                <h2 className="font-display font-bold tracking-tighter">{t.roster.title}</h2>
              </div>
              <div className="flex flex-col items-end gap-4">
                <p className="text-white/30 max-w-xs text-[10px] uppercase tracking-[0.2em] leading-relaxed font-medium text-right">
                  {t.roster.subtitle}
                </p>
                {selectedGenre && (
                  <button
                    onClick={() => setSelectedGenre(null)}
                    className="text-[9px] font-bold uppercase tracking-widest text-brand-cyan hover:text-white transition-colors flex items-center gap-2"
                  >
                    <X size={12} /> {t.roster.clear}
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredArtists.map((artist, idx) => (
                  <motion.article
                    key={`${artist.name}-${lang}`}
                    layout
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    transition={{
                      duration: 0.4,
                      delay: (idx % 4) * 0.05,
                      ease: [0.23, 1, 0.32, 1]
                    }}
                    className="relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] group cursor-pointer"
                    onClick={() => setActiveArtist(artist)}
                  >
                    <HUDCorners />
                    <div className="aspect-[3/4] overflow-hidden relative">
                      <img
                        src={artist.image}
                        alt={artist.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/20 to-transparent opacity-90" />

                      <div className="absolute bottom-0 left-0 w-full p-6">
                        <div className="flex gap-3 mb-3">
                          <a href={artist.socials.instagram} onClick={(e) => e.stopPropagation()} className="text-white/40 hover:text-brand-pink transition-colors">
                            <Instagram size={14} />
                          </a>
                          <a href={artist.socials.soundcloud} onClick={(e) => e.stopPropagation()} className="text-white/40 hover:text-brand-cyan transition-colors">
                            <Cloud size={14} />
                          </a>
                          <a href={artist.socials.spotify} onClick={(e) => e.stopPropagation()} className="text-white/40 hover:text-green-500 transition-colors">
                            <Music size={14} />
                          </a>
                        </div>
                        <span className="text-brand-cyan text-[9px] font-bold uppercase tracking-[0.3em] mb-1 block">
                          {artist.genre}
                        </span>
                        <h3 className="font-display text-2xl font-bold mb-2 tracking-tight">{artist.name}</h3>

                        <div className="max-h-0 group-hover:max-h-28 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out overflow-hidden mt-4">
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); setActiveArtist(artist); }}
                              className="flex-1 bg-white text-brand-dark py-3 rounded-lg text-[9px] font-bold uppercase tracking-widest text-center hover:bg-brand-cyan transition-colors btn-glow">
                              View Profile
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setPrefilledArtist(artist.name);
                                setActiveArtist(null);
                                setTimeout(() => document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" }), 100);
                              }}
                              className="flex-1 border border-white/20 text-white py-3 rounded-lg text-[9px] font-bold uppercase tracking-widest text-center hover:bg-white/10 transition-colors">
                              Book Now
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </section>

        <AncestralDivider />

        {/* About Section */}
        <section id="about" className="py-24 md:py-32 relative">
          <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 md:gap-24 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="font-display font-bold mb-10 tracking-tighter leading-tight">
                  {t.about.title1} <br />
                  <span className="text-gradient">{t.about.title2}</span>
                </h2>
                <div className="space-y-8 text-white/60 font-light leading-relaxed">
                  <p>{t.about.p1}</p>
                  <p>{t.about.p2}</p>
                  <div className="grid grid-cols-2 gap-8 md:gap-12 pt-10 border-t border-white/5">
                    <div>
                      <div className="text-brand-cyan font-display text-3xl md:text-4xl font-bold mb-2 tracking-tighter">20+</div>
                      <div className="text-[9px] uppercase tracking-[0.2em] text-white/30 font-bold">{t.about.stat1}</div>
                    </div>
                    <div>
                      <div className="text-brand-pink font-display text-3xl md:text-4xl font-bold mb-2 tracking-tighter">500+</div>
                      <div className="text-[9px] uppercase tracking-[0.2em] text-white/30 font-bold">{t.about.stat2}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
              <div className="relative group">
                <HUDCorners />
                <div className="aspect-square rounded-3xl overflow-hidden glass-panel p-3">
                  <img
                    src="/underground/464270979_8650433881658499_378131846550286405_n.jpg"
                    alt="Underground Energy"
                    className="w-full h-full object-cover rounded-2xl opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-80 transition-all duration-1000"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="absolute -z-10 -bottom-10 -right-10 w-48 md:w-64 h-48 md:h-64 bg-brand-cyan/10 blur-[100px] rounded-full" />
              </div>
            </div>
          </div>
        </section>

        <AncestralDivider />

        {/* Event Radar Section */}
        <EventRadar t={t.radar} />

        <AncestralDivider />

        {/* Booking Section */}
        <section id="booking" className="py-24 md:py-32 relative">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto">
              <div className="grid lg:grid-cols-5 gap-12 md:gap-16">
                <div className="lg:col-span-2">
                  <h2 className="font-display font-bold mb-8 tracking-tighter leading-[0.9]">
                    {t.booking.title}
                  </h2>
                  <p className="text-white/40 font-light text-lg mb-12">
                    {t.booking.subtitle}
                  </p>
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 text-white/60">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                        <Mail size={16} className="text-brand-cyan" />
                      </div>
                      <span className="text-sm font-medium">labs.ladder@gmail.com</span>
                    </div>
                    <div className="flex items-center gap-4 text-white/60">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                        <Globe size={16} className="text-brand-pink" />
                      </div>
                      <span className="text-sm font-medium">Global Representation</span>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-3">
                  <div className="glass-panel p-6 md:p-12 rounded-[2rem] md:rounded-[2.5rem] relative">
                    <HUDCorners />
                    {formStatus === "success" ? (
                      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-brand-cyan/10 rounded-full flex items-center justify-center mx-auto mb-8">
                          <Zap className="text-brand-cyan" size={32} />
                        </div>
                        <h3 className="font-display font-bold mb-4 tracking-tight">{t.booking.successTitle}</h3>
                        <p className="text-white/40 font-light mb-10">{t.booking.successMsg}</p>
                        <button onClick={() => setFormStatus("idle")} className="text-brand-cyan text-xs font-bold uppercase tracking-widest hover:underline">
                          {t.booking.another}
                        </button>
                      </motion.div>
                    ) : (
                      <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-6 md:gap-8">
                        <div className="sm:col-span-2 space-y-3">
                          <label className="text-[9px] uppercase tracking-[0.3em] text-white/30 font-bold ml-1">Artist</label>
                          <select
                            name="artist"
                            value={prefilledArtist}
                            onChange={(e) => setPrefilledArtist(e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-5 focus:outline-none focus:border-brand-cyan transition-colors text-sm appearance-none cursor-pointer"
                            style={{ colorScheme: "dark" }}
                          >
                            <option value="" className="bg-brand-dark">Any Artist</option>
                            {allArtists.map(a => (
                              <option key={a.name} value={a.name} className="bg-brand-dark">{a.name} — {a.genre}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-3">
                          <label className="text-[9px] uppercase tracking-[0.3em] text-white/30 font-bold ml-1">{t.booking.name}</label>
                          <input required name="name" type="text" className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-5 focus:outline-none focus:border-brand-cyan transition-colors text-sm" />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[9px] uppercase tracking-[0.3em] text-white/30 font-bold ml-1">{t.booking.company}</label>
                          <input required name="company" type="text" className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-5 focus:outline-none focus:border-brand-cyan transition-colors text-sm" />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[9px] uppercase tracking-[0.3em] text-white/30 font-bold ml-1">{t.booking.location}</label>
                          <input required name="location" type="text" className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-5 focus:outline-none focus:border-brand-cyan transition-colors text-sm" />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[9px] uppercase tracking-[0.3em] text-white/30 font-bold ml-1">{t.booking.date}</label>
                          <input required name="date" type="date" className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-5 focus:outline-none focus:border-brand-cyan transition-colors text-sm" style={{ colorScheme: "dark" }} />
                        </div>
                        <div className="sm:col-span-2 space-y-3">
                          <label className="text-[9px] uppercase tracking-[0.3em] text-white/30 font-bold ml-1">{t.booking.budget}</label>
                          <select name="budget" className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-5 focus:outline-none focus:border-brand-cyan transition-colors text-sm appearance-none cursor-pointer" style={{ colorScheme: "dark" }}>
                            <option className="bg-brand-dark">R$ 500 – R$ 2.000</option>
                            <option className="bg-brand-dark">R$ 2.000 – R$ 5.000</option>
                            <option className="bg-brand-dark">R$ 5.000 – R$ 15.000</option>
                            <option className="bg-brand-dark">R$ 15.000 – R$ 30.000</option>
                            <option className="bg-brand-dark">R$ 30.000+</option>
                          </select>
                        </div>
                        <div className="sm:col-span-2 space-y-3">
                          <label className="text-[9px] uppercase tracking-[0.3em] text-white/30 font-bold ml-1">{t.booking.message}</label>
                          <textarea name="message" rows={4} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-5 focus:outline-none focus:border-brand-cyan transition-colors text-sm resize-none" />
                        </div>
                        <div className="sm:col-span-2">
                          <button type="submit" disabled={formStatus === "submitting"} className="w-full bg-white text-brand-dark font-bold uppercase tracking-[0.3em] py-5 md:py-6 rounded-2xl hover:bg-brand-cyan transition-all flex items-center justify-center gap-4 group btn-glow neon-aura">
                            {formStatus === "submitting" ? t.booking.submitting : t.booking.cta}
                            <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Artist Drawer/Modal */}
      <AnimatePresence>
        {activeArtist && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveArtist(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] cursor-pointer"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-xl bg-brand-dark z-[70] border-l border-white/10 shadow-2xl overflow-y-auto"
            >
              <div className="relative h-80 md:h-96">
                <img src={activeArtist.image} alt={activeArtist.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark to-transparent" />
                <button
                  onClick={() => setActiveArtist(null)}
                  className="absolute top-8 right-8 w-12 h-12 bg-black/50 backdrop-blur-xl rounded-full flex items-center justify-center text-white hover:bg-brand-cyan transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 md:p-12 -mt-20 relative z-10">
                <span className="text-brand-cyan text-[10px] font-bold uppercase tracking-[0.5em] mb-4 block">
                  {activeArtist.genre}
                </span>
                <h2 className="font-display text-5xl md:text-7xl font-bold mb-6 tracking-tighter">{activeArtist.name}</h2>

                <div className="space-y-8 mb-12">
                  <p className="text-white/60 text-lg font-light leading-relaxed">
                    {t.bios[activeArtist.name as keyof typeof t.bios]}
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  <a href="#booking" onClick={() => setActiveArtist(null)} className="w-full bg-white text-brand-dark py-6 rounded-2xl text-xs font-bold uppercase tracking-[0.3em] text-center hover:bg-brand-cyan transition-all btn-glow flex items-center justify-center gap-3">
                    Request Booking <ArrowRight size={16} />
                  </a>
                  <div className="flex flex-wrap gap-4">
                    {activeArtist.socials.instagram && activeArtist.socials.instagram !== "#" && (
                      <a href={activeArtist.socials.instagram} target="_blank" rel="noreferrer" className="glass-panel w-12 h-12 rounded-2xl flex items-center justify-center hover:border-brand-pink hover:text-brand-pink transition-all">
                        <Instagram size={20} />
                      </a>
                    )}
                    {activeArtist.socials.soundcloud && activeArtist.socials.soundcloud !== "#" && (
                      <a href={activeArtist.socials.soundcloud} target="_blank" rel="noreferrer" className="glass-panel w-12 h-12 rounded-2xl flex items-center justify-center hover:border-brand-cyan hover:text-brand-cyan transition-all">
                        <Cloud size={20} />
                      </a>
                    )}
                    {activeArtist.socials.spotify && activeArtist.socials.spotify !== "#" && (
                      <a href={activeArtist.socials.spotify} target="_blank" rel="noreferrer" className="glass-panel w-12 h-12 rounded-2xl flex items-center justify-center hover:border-green-500 hover:text-green-500 transition-all">
                        <Music size={20} />
                      </a>
                    )}
                    {activeArtist.socials.youtube && activeArtist.socials.youtube !== "#" && (
                      <a href={activeArtist.socials.youtube} target="_blank" rel="noreferrer" className="glass-panel w-12 h-12 rounded-2xl flex items-center justify-center hover:border-red-500 hover:text-red-500 transition-all">
                        <Youtube size={20} />
                      </a>
                    )}
                    {activeArtist.presskit && activeArtist.presskit !== "#" && (
                      <a href={activeArtist.presskit} target="_blank" rel="noreferrer" className="glass-panel px-4 h-12 rounded-2xl flex items-center justify-center hover:border-brand-cyan hover:text-brand-cyan transition-all group">
                        <div className="flex items-center gap-2">
                          <ExternalLink size={16} />
                          <span className="text-[9px] font-bold uppercase tracking-widest">Presskit</span>
                        </div>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* WhatsApp Floating Button — Mobile */}
      <a
        href={`https://wa.me/5511999999999?text=${encodeURIComponent("Olá! Quero fazer um booking pela Ladder Labs.")}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-28 left-6 z-40 lg:hidden w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(37,211,102,0.4)] hover:scale-110 transition-transform"
        aria-label="WhatsApp Booking"
      >
        <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>

      <div className="sticky-cta-mobile">
        <a href="#booking" className="w-full bg-white text-brand-dark font-bold uppercase tracking-[0.3em] py-5 rounded-2xl shadow-2xl flex items-center justify-center gap-3 btn-glow neon-aura">
          Book Artist <ArrowRight size={18} />
        </a>
      </div>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5 relative">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-16">
            <div className="flex flex-col items-center md:items-start gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-brand-cyan to-brand-pink rounded-sm rotate-45" />
                  <span className="font-display font-bold text-xl tracking-tighter">LADDER<span className="text-gradient">LABS</span></span>
                </div>
                <div className="h-6 w-px bg-white/10" />
                <div className="flex flex-col">
                  <span className="text-[8px] uppercase tracking-widest text-white/40 font-bold">In Partnership with</span>
                  <span className="text-[10px] font-display font-bold tracking-tighter text-white/80">NEVERLAND RECORDS</span>
                </div>
              </div>
              <p className="text-white/30 text-[10px] uppercase tracking-[0.4em] font-bold">{t.footer.desc}</p>
            </div>

            <div className="flex gap-6">
              <a href="https://www.instagram.com/ladder.labs/" target="_blank" rel="noopener noreferrer" className="w-14 h-14 rounded-2xl border border-white/5 flex items-center justify-center hover:border-brand-cyan/30 hover:text-brand-cyan transition-all bg-white/[0.02]">
                <Instagram size={20} />
              </a>
              <a href="mailto:labs.ladder@gmail.com" className="w-14 h-14 rounded-2xl border border-white/5 flex items-center justify-center hover:border-brand-pink/30 hover:text-brand-pink transition-all bg-white/[0.02]">
                <Mail size={20} />
              </a>
              <a href="#" className="w-14 h-14 rounded-2xl border border-white/5 flex items-center justify-center hover:border-brand-cyan/30 hover:text-brand-cyan transition-all bg-white/[0.02]">
                <Globe size={20} />
              </a>
            </div>

            <div className="text-center md:text-right space-y-2">
              <p className="text-white/30 text-[9px] uppercase tracking-[0.4em] font-bold">{t.footer.copy}</p>
              <p className="text-white/10 text-[9px] uppercase tracking-[0.4em] font-bold">{t.footer.rights}</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
