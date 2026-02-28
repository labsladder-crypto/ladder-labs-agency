/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring } from "motion/react";
import {
  Search,
  Activity,
  X,
  Menu,
  ChevronRight,
  ChevronDown,
  Instagram,
  Cloud,
  Music,
  ExternalLink,
  Youtube,
  Mail,
  Globe,
  ArrowRight,
  Plus,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  FileText
} from "lucide-react";
import { MAIN_GENRES, SUBGENRES, BPM_TIERS, MainGenre } from "./data/genreTaxonomy";
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
      budget: "Estimated Budget (BRL)",
      budgetOptions: {
        tier1: "R$ 500 – R$ 2.000",
        tier2: "R$ 2.000 – R$ 5.000",
        tier3: "R$ 5.000 – R$ 15.000",
        tier4: "R$ 15.000 – R$ 30.000",
        tier5: "R$ 30.000+"
      },
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
      "EVVE": "EVVE emerges as a strong, feminine presence within the electronic scene, guided through Minimal and nuances of Tech House. Her sound borders the underground and the mainstream, revealing her unique sonic identity.\n✧\nWith natural charisma, light energy, yet a sharp attitude, EVVE stands out by delivering immersive sets filled with minimalist tones, deep grooves, and striking elements!\n✧\nHer mission is clear: transforming the dance floor into a unique sensory experience! Each performance is an energetic, hypnotic, and groove-laden immersion.",
      "PAJÔ": "Born in Cuiabá, Vinícius Junqueira aka PAJÔ is a DJ/producer boasting over a decade's experience bringing music to raves across 7 Brazilian states. His journey has shaped his unique, energetic Psytrance and Progressive style.\n\nBeyond music, Vinícius is an AI, Crypto, and blockchain enthusiast. He believes in decentralization as a transformative tool. To him, music connects cultures, people, and ideas.",
      "NRZ": "Meet Marcelo Neres, A.K.A NRZ Project, a DJ conquering the scene with hard-hitting Progressive Psytrance. The name NRZ refers to Non-Return-to-Zero coding, symbolizing musical continuity and fluidity.\n\nNRZ is known for creating immersive atmospheres via a meticulous selection of underground tracks that create a fascinating effect of the \"unknown.\" Prepare for a deep dive into emotion and continuous movement.",
      "MOLUSKO": "Carlos Baratella Junior A.k.a Molusko. Over a vibrant decade submerged in trance, Molusko stands as a true devotee of psychedelia.\n\nHe promises to take the crowd on a transcendent journey full of hypnotic sounds and sensory experiences. Guaranteed to deliver hi-tech sets that transcend the ordinary and elevate the night to unforgettable dimensions.",
      "JUREMA": "Isabela Di Bianco is the creative mind behind Jurema. With over a decade dedicated to music, she holds a rich musical background. She weaves distinct sounds into captivating and meticulous textures.\n\nThis versatile artist has performed at numerous festivals across Brazil. Beyond being a DJ, she also acts as a producer, event organizer, and artistic curator.",
      "PRADIM": "Felipe Prado, better known as PRADIM. A DJ and producer for 3 years, his original tracks leave the dancefloor burning. PRADIM navigates through House, Tech House, Deep Tech, Minimal, and Techno.\n\nLeaving his unique mark on every floor he plays, PRADIM is bringing heavy grooves to dancefloors everywhere with immersive sets!",
      "SESI'OHM": "SESI'OHM is a force of nature on the psytrance stage. Blending classic elements with modern production, his sound is a powerful tribute to the spirit of the psychedelic dancefloor.",
      "DASH": "Dash is Willyan Gabriel's project, redefining Progressive Psytrance on the dance floor. Dash creates a cauldron of vibrations where crowds feel every frequency and dance with total surrender in peak moments.\n\nDash connects classic Progressive directly to the power of Full On—ideal for transition or peak-time slots in mainstage festivals.",
      "UKACZ": "“Ukacz” is the authentic project from DJ and producer Marcos Vinicius. Combining years of experience with both classic and current influences, Ukacz brings a unique approach to the finest of House and Tech House.\n\nMuch more than a DJ, Ukacz delivers personality-packed sets bursting with groove, turning every event into an experience of pure connection.",
      "JUNNO": "Currently based in Santa Catarina, JUNNO is a promising act composed of DJ/producer Vladimir Junior, a graduate of AIMEC—one of Brazil's top courses.\n\nThe project sets a unique rhythm, dropping explosive sets that blend Tech House with Bass House. Performing at major parties and clubs, \"DJ Junno\" is rapidly building a history of success.",
      "RISAFFI": "Driven by a deep passion for Tech House, his essence moves in perfect sync with striking grooves and immersive rhythms. His sound is born from the connection between beats and energy.\n\nTransforming passion into creation, he delivers consistent sets full of presence and fluidity. Whether on open dance floors or underground clubs, day or night, under sun or rain, every set carries identity, sound quality, and intention.",
      "PIMENTA": "PIMENTA delivers the explosive energy of Full On psytrance. His sets are a journey through high-speed rhythms and uplifting melodies, designed for peak-time festival moments.",
      "LEROCK'S": "Rooted in São Paulo's underground scene, Lerock’s emerged in 2023 with a relentless beat and contagious energy. Beyond just an artist, he's the creator of the Neverland Festival, mixing music and art.\n\nIn the studio, he shapes techno and house into signature original productions—heavy kicks, hypnotic grooves, and hair-raising drops. Lerock's isn't just commanding decks; he is propelling the scene forward.",
      "BÁRBARA THOMAZ": "BÁRBARA THOMAZ finds in electronic music the force driving her artistic expression. Early on, she realized beats carry something profound—awakening emotions, connecting to the present, and changing atmospheres.\n\nIn Melodic Techno, she builds her identity by balancing intensity and emotion. Every set is a sensory journey that touches the soul. Her work is an invitation to submit to the music, move freely, and connect genuinely with the now.",
      "JUNIOR SANT": "Junior Sant, a DJ/producer with a 15-year career, focuses on exploring the rich nuances of Techno, Melodic Techno, Indie Dance, and Afro House.\n\nHe doesn't stick to pre-made formulas, constantly searching for new textures. A master of both vinyl and digital formats, his performances are hybrid masterpieces mixing precise mixing with synthesizers and drum machines.",
      "ELOAH": "Groove is ELOAH's main signature—coupled with attitude, presence, and precise dance floor reading. Her sets flow between Tech House and Minimal, building energy naturally and engaging the audience in fluid, intentional transitions.\n\nEach performance carries its own identity. Nothing is generic or repeated. Eloah understands music as a connection and makes the dance floor feel it entirely, conducting the mood with sensitivity and rhythm. Where she plays, the vibe transforms.",
      "LACER": "Spearheaded by Caio Lacerda, the 'Lacer' project was born out of a passion for electronic music and already counts over 9 years of history, bringing authenticity and versatility to dance floors across Brazil.\n\nWith roots in House Music and exploring nuances of Tech and Minimal House, Lacer transforms every performance into a true sonic journey, easily shifting from engaging minimal warmups to peak-time energy explosions.",
      "UMBRA": "In a scene where electronic music pulses like the heartbeat of the night, two distinctly sourced artists unite under the mysterious title: Umbra.\n\nJunior Sant, a 15-year veteran, alongside Marry, a rising talent with a burning passion for discovery, explore melodic techno together. Inspired by the duality of light and dark, their performances become an ethereal ritual that transports crowds into an immersive, dream-like state.",
      "IZZI": "IZZI brings a unique blend of indie dance and acid house to the roster. Her sets are eclectic and high-energy, full of unexpected twists and infectious rhythms.",
      "BET'S": "BET'S is a specialist in minimal tech house. Her approach is all about the subtle details and the perfect groove, creating a hypnotic experience that captivates the floor.",
      "GENÊ": "GENÊ is the latest addition to the Ladder Labs family, bringing a fresh perspective on House and Indie Dance. Blending classic house foundations with modern indie sensibilities, his sound is both nostalgic and forward-thinking.",
      "IDEMAX": "IDEMAX is a powerhouse of Full On psytrance. His productions are known for their massive energy, crystal-clear sound design, and infectious melodies that dominate the largest festival stages.",
      "CAMPELLO": "CAMPELLO delivers a high-octane Full On experience. With a focus on driving basslines and psychedelic storytelling, his sets are a journey through the peak moments of the trance experience.",
      "DAMATA": "DAMATA is a Forest project born from the deep connection between music, nature, and elevated states of consciousness. Producing between 140-160 BPM, he brings dense grooves and hypnotic melodies.\n\nWith a ritualistic sound aesthetic, DAMATA builds spiritual atmospheres that serve as portals into trance and self-knowledge. The ritual begins when the sonic forest awakens.",
      "DOTA": "DOTA specializes in the emotional depth of Progressive psytrance. His music is characterized by beautiful build-ups, melodic complexity, and a groove that resonates with the soul.",
      "KORDIE": "KORDIE brings a fresh energy to the Tech House scene. His sets are a blend of punchy drums and catchy hooks, designed to keep the energy high and the dancefloor packed.",
      "PITT MALIC": "Pitt Malic (Pedro Ripoli) is turning heads in the underground with his unique signature: psytechno loaded with heavy bass and creeping harmonies. Moving between the dark and the transcendent, he leads audiences through dense atmospheres.\n\nHis sound is a precise fusion of techno's raw energy and psychedelic textures, deploying surgical drops in a mind-bending sonic narrative.",
      "PEDRO TAB": "PEDRO TAB is a specialist in Peak Time Techno. His sound is relentless, powerful, and uncompromising, designed for the most intense moments of the night in the world's best warehouses.",
      "WAVEMOON": "WAVEMOON delivers a cosmic psytrance experience. His music is a blend of high-speed storytelling and celestial atmospheres, taking the dancefloor on a journey through the stars.",
      "NEXUS": "NEXÜS is Matheus's Psytrance project, created with a clear goal: to spread joy and build deep bonds on the dance floor. With an immense stage presence, NEXÜS lives the moment with the audience.\n\nHis sets carry progressive identity, hypnotic buildups, and powerful drops guided by precise crowd reading. It is a rising project rapidly making its mark on important line-ups.",
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
      budgetOptions: {
        tier1: "R$ 500 – R$ 2.000",
        tier2: "R$ 2.000 – R$ 5.000",
        tier3: "R$ 5.000 – R$ 15.000",
        tier4: "R$ 15.000 – R$ 30.000",
        tier5: "R$ 30.000+"
      },
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
      "EVVE": "EVVE emerge como uma presença forte e feminina dentro da cena eletrônica, guiada através do Minimal e nuances do Tech House, seu som transita entre o underground e o mainstream assim revelando a sua identidade sonora.\n✧\nCom carisma natural, energia leve mas atitude sonora afiada, EVVE se destaca por entregar sets imersivos e envolventes que exploram timbres minimalistas, grooves profundos e elementos marcantes!\n✧\nSua missão é clara: transformar a pista em uma experiência sensorial única! Cada apresentação é uma imersão sonora onde não apenas ouvem, mas habitam o som, resultando em performances enérgicas, hipnóticas e carregadas de groove — a essência do que EVVE representa.",
      "PAJÔ": "Nascido e criado em Cuiabá, Vinícius Junqueira aka PAJÔ é um DJ e produtor com mais de 10 anos de carreira, levando sua música para festas raves, clubs e universidades em mais de 7 estados brasileiros. Sua jornada musical ganhou forma absorvendo influências que moldaram seu estilo único e energético do Psytrance e Progressive.\n\nAlém da música, Vinícius é um entusiasta das Criptomoedas, Inteligência Artificial e da tecnologia blockchain, acreditando no futuro da música digital e na descentralização como ferramentas transformadoras. A música para ele é uma paixão que conecta pessoas, culturas e ideias.",
      "NRZ": "Conheça Marcelo Neres, A.K.A NRZ Project, que tem conquistado a cena eletrônica com seu estilo de Psytrance Progressivo contundente. O nome NRZ é uma referência à codificação NRZ (Non-Return-to-Zero), que simboliza a continuidade e a fluidez musical sem pausas.\n\nOs sets de NRZ são conhecidos por criar atmosferas imersivas, com seleção cuidadosa de tracks undergrounds criando um efeito de \"desconhecido\" que fascina a galera. Uma jornada sonora intensa numa dimensão de emoções e movimento.",
      "MOLUSKO": "Carlos Baratella Junior A.k.a Molusko. Com uma trajetória de uma década imersa na vibrante cena trance, Molusko tem se destacado como um verdadeiro entusiasta e amante da psicodelia.\n\nPromete levar o público a uma jornada transcendente, repleta de sons hipnóticos e experiências sensoriais únicas, garantindo sets que transcendem o comum e transportam a audiência para dimensões sonoras inesquecíveis do Hi Tech.",
      "JUREMA": "Isabela Di Bianco é a mente criativa por trás do projeto Jurema. Com mais de uma década de dedicação à música, ela traz consigo uma bagagem musical rica e diversificada. Sua habilidade em unir diferentes sonoridades convida o público a se entregar às texturas músicas escolhidas minuciosamente.\n\nEsta talentosa artista já se apresentou em diversos eventos e festivais pelo Brasil. Além de DJ, ela também se aventura nas produções musicais, organizações de eventos e atua como curadora artística.",
      "PRADIM": "Felipe Prado, mais conhecido como PRADIM. DJ e produtor de música eletrônica há 3 anos, com suas músicas autorais que deixam as pistas pegando fogo, PRADIM mistura seu som entre House, Tech House, Deep Tech, Minimal House e Techno.\n\nDeixando sua marca única em cada pista que toca, com sets envolventes PRADIM vem se destacando aos poucos trazendo muito groove pras pistas do Brasil por onde passa!",
      "SESI'OHM": "SESI'OHM é uma força da natureza no palco psytrance. Misturando elementos clássicos com produção moderna, seu som é um tributo poderoso ao espírito da pista de dança psicodélica.",
      "DASH": "Dash é o projeto de Willyan Gabriel que chegou para redefinir o conceito de Progressive Psytrance nas pistas. Dash transforma a pista em um caldeirão de vibrações onde o público é estimulado a sentir cada frequência, dançar com entrega total e pular em celebração nos picos de energia.\n\nDash representa a escola do Progressive que se conecta diretamente com a energia do Full On, ideal para horários de transição ou de pico em festivais que exigem power e entrega total.",
      "UKACZ": "“Ukacz” novo e autêntico projeto do DJ e Produtor Marcos Vinicius. Combinando anos de experiência com influências clássicas e atuais, Ukacz traz uma abordagem única explorando o melhor do House e Tech House.\n\nMuito mais que um DJ, Ukacz entrega sets cheios de personalidade e muito groove, transformando cada evento em uma experiência de pura energia e conexão.",
      "JUNNO": "Residente hoje em Santa Catarina, JUNNO é uma promessa composta pelo DJ e produtor Vladimir Junior, formado em um dos mais conceituados cursos do Brasil, a AIMEC.\n\nO projeto é um ritmo de pistas únicas, com sets explosivos que mesclam Tech House e Bass House. Se apresentando em festas e clubs para grandes públicos, tornou-se um expoente no interior paulista. \"DJ Junno\" vem construindo uma história de muito dinamismo e sucesso na cena.",
      "RISAFFI": "Impulsionado por uma paixão profunda pelo Tech House, sua essência se move em perfeita sintonia com grooves marcantes e ritmos envolventes. Seu som nasce da conexão entre batida e energia.\n\nAo transformar essa paixão em criação, o resultado se revela em sets consistentes, cheios de presença e fluidez, onde cada transição sustenta a narrativa da noite. Seja em pistas abertas ou clubs fechados, de dia ou de madrugada, cada apresentação carrega identidade, qualidade sonora e intenção.",
      "PIMENTA": "PIMENTA entrega a energia explosiva do Full On psytrance. Seus sets são uma jornada por ritmos de alta velocidade e melodias edificantes, projetados para momentos de pico em festivais.",
      "LEROCK'S": "De raízes fincadas na cena underground de São Paulo, Lerock’s surgiu em 2023 como DJ e produtor, e já deixou sua marca em palcos levando sua batida implacável e energia contagiante. Mais do que um artista, é o idealizador do Neverland Festival, um projeto que reflete sua visão ousada.\n\nNos estúdios, transforma influências do techno e house em produções autorais com identidade própria – batidas pesadas, grooves hipnóticos e drops que arrepiam. O futuro? Tão intenso quanto seus sets. Acompanhe a viagem.",
      "BÁRBARA THOMAZ": "Bárbara Thomaz encontra na música eletrônica a força que impulsiona sua expressão artística. Desde cedo percebeu que as batidas carregam algo além do som — despertam emoções profundas, conectam ao presente e transformam a atmosfera.\n\nNo Melodic Techno, constrói sua identidade unindo energia, intensidade e emoção em equilíbrio. Cada set é pensado como uma jornada sensorial para tocar a alma. Sua presença e sensibilidade convidam à entrega e ao movimento livre.",
      "JUNIOR SANT": "Junior Sant DJ e produtor musical de São João da Boa Vista-SP, ao longo de 15 anos constrói sua trajetória com foco na exploração das nuances do Techno, Melodic Techno, Indie Dance e Afro House.\n\nEle não se apega a fórmulas prontas, buscando constantemente novas texturas e ritmos. A aptidão para a discotecagem foi aprimorada através da busca por conhecimento. O artista domina tanto vinis quanto o digital. Suas apresentações são performances híbridas que combinam a precisão com a improvisação e sintetizadores.",
      "ELOAH": "ELOAH tem no groove sua principal assinatura — acompanhado de atitude, presença e uma leitura de pista precisa. Seus sets transitam entre o Tech House e o Minimal, construindo uma energia que cresce com naturalidade, envolvendo o público em transições fluidas e cheias de intenção.\n\nCada apresentação carrega identidade própria. Nada é genérico, nada é repetido. Eloah entende a música como conexão e faz a pista sentir isso na pele, conduzindo o ambiente com sensibilidade, ritmo e personalidade. Onde Eloah toca, a vibração muda.",
      "LACER": "Sob o comando de Caio Lacerda, o projeto “Lacer” nasceu da paixão pela música eletrônica e já soma mais de 9 anos de trajetória, levando autenticidade e versatilidade a pistas em diversas regiões do Brasil.\n\nCom raízes na House Music e explorando as nuances do Tech-House e Minimal-House, Lacer transforma cada apresentação em uma verdadeira jornada sonora. Sua marca registrada são sets que transitam de warm-ups minimalistas até explosões de energia no Peak Time com alto nível de qualidade.",
      "UMBRA": "Em um cenário onde a música eletrônica pulsa como o coração da noite, dois artistas, vindos de caminhos distintos, se encontraram sob a égide de um nome que ressoa com mistério: Umbra.\n\nJunior Sant, um veterano das pistas com 15 anos de experiência, e Marry, um talento em ascensão com a paixão ardente da descoberta, trazem o techno melódico como canal de expressão. Suas apresentações são um ritual onde melodias etéreas se entrelaçam com batidas imersivas oníricas.",
      "IZZI": "IZZI traz uma mistura única de indie dance e acid house para o roster. Seus sets são ecléticos e de alta energia, cheios de reviravoltas inesperadas e ritmos contagiantes.",
      "BET'S": "BET'S é especialista em tech house minimalista. Sua abordagem é sobre os detalhes sutis e o groove perfeito, criando uma experiência hipnótica que cativa a pista.",
      "GENÊ": "GENÊ é a mais recente adição à família Ladder Labs, trazendo uma nova perspectiva sobre House e Indie Dance. Misturando as fundações clássicas do house com sensibilidades modernas do indie, seu som é nostálgico e visionário.",
      "IDEMAX": "IDEMAX é uma potência do Full On psytrance. Suas produções são conhecidas pela energia massiva, sound design cristalino e melodias contagiantes que dominam os maiores palcos de festivais.",
      "CAMPELLO": "CAMPELLO oferece uma experiência Full On de alta octanagem. Com foco em linhas de baixo vigorosas e narrativa psicodélica, seus sets são um jornada pelos momentos de pico da experiência trance.",
      "DAMATA": "DAMATA é um projeto de Forest que nasce da conexão profunda entre música, natureza e estados elevados de consciência. Suas produções transitam entre 140 e 160 BPM, conduzidas por grooves densos, linhas orgânicas e melodias hipnóticas.\n\nCom uma estética sonora introspectiva e ritualística, DAMATA constrói atmosferas espirituais chamando para o transe e autoconhecimento. O ritual se inicia quando a floresta sonora desperta.",
      "DOTA": "DOTA é especializado na profundidade emocional do Progressive psytrance. Sua música é caracterizada por belos build-ups, complexidade melódica e um groove que ressoa com a alma.",
      "KORDIE": "KORDIE traz uma nova energia para a cena Tech House. Seus sets são uma mistura de baterias marcantes e ganchos cativantes, projetados para manter a energia alta e a pista lotada.",
      "PITT MALIC": "Pitt Malic (Pedro Ripoli) vem ganhando destaque na cena underground por sua assinatura única: o psytechno de bass marcante e harmonia sorrateira. Com sets que transitam entre o sombrio e o transcendental, conduz o público por atmosferas densas, onde cada batida é uma convocação ao transe coletivo.\n\nSeu som é uma fusão precisa entre a energia do techno e texturas psicodélicas em grooves hipnóticos com drops cirúrgicos.",
      "PEDRO TAB": "PEDRO TAB é especialista em Peak Time Techno. Seu som é implacável, poderoso e sem concessões, desenhado para os momentos mais intensos da noite nos melhores galpões do mundo.",
      "WAVEMOON": "WAVEMOON proporciona uma experiência de psytrance cósmico. Sua música é uma mistura de narrativa em alta velocidade e atmosferas celestiais, levando a pista de dança a um jornada pelas estrelas.",
      "NEXUS": "NEXÜS é o projeto criado por Matheus, DJ e produtor de Psytrance. O projeto nasceu com o objetivo claro de espalhar alegria e criar conexões profundas na pista. Com forte presença de palco, NEXÜS transforma cada apresentação em experiência vivendo o momento com o público.\n\nSeus sets carregam identidade progressiva, construções hipnóticas e drops marcantes, guiados por emoção e leitura precisa. Um projeto em franca ascensão.",
      "BAZZE": "BAZZE é um talento em ascensão, trazendo uma nova perspectiva para a pista de dança com um groove contagioso e atmosfera profunda."
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
      eventDetails: "Detalles del Evento",
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
      desc: "Arquitectos del Sonido Imersivo",
      copy: "© 2026 LADDER LABS AGENCY",
      rights: "TODOS LOS DERECHOS RESERVADOS"
    },
    bios: {
      "EVVE": "EVVE emerge como una presencia fuerte y femenina en la escena electrónica, guiada por el Minimal y los matices del Tech House. Su sonido transita entre el underground y el mainstream.\n✧\nCon carisma natural y energía ligera pero actitud sonora afilada, EVVE destaca al ofrecer sets inmersivos llenos de tonos minimalistas y ritmos profundos.\n✧\nSu misión es clara: transformar la pista en una experiencia sensorial única, con interpretaciones energéticas e hipnóticas.",
      "PAJÔ": "Nacido en Cuiabá, PAJÔ es un DJ y productor con 10 años de experiencia que ha moldeado un estilo particular de Psytrance y Progresivo.\n\nAdemás de su pasión por la música, cree firmemente en herramientas transformadoras digitales como las Criptos y la Inteligencia Artificial. Para él, la música y la tecnología unen culturas.",
      "NRZ": "Conoce a NRZ Project, DJ que está reinando con su Psytrance Progresivo. Su nombre proviene del sistema NRZ (Non-Return-to-Zero), que simboliza flujo ininterrumpido.\n\nCrea sets inmersivos y atmósferas únicas con selecciones underground, cautivando de forma sorprendente en cada momento.",
      "MOLUSKO": "A lo largo de 10 años en el género viva el trance acelerado, Molusko adora la psicodelia pura.\n\nInvita a atravesar un portal asombroso y transcendente de experimentación en Hi Tech repleto de vibras alienígenas.",
      "JUREMA": "Isabela Di Bianco es la mente en el proyecto Jurema. Lleva más de una década ofreciendo texturas densas e instrumentadas.\n\nEsta artista experta sabe transitar el panorama musical también produciendo y actuando como organizadora indispensable en Brasil.",
      "PRADIM": "Felipe Prado, mejor conocido como PRADIM. DJ y productor desde hace 3 años, sus pistas originales incendian las pistas de baile. PRADIM mezcla House, Tech House, Deep Tech y Minimal Techno.\n\nDejando su huella única con sets inmersivos, PRADIM se destaca cada vez más llevando mucho groove a las pistas por donde pasa.",
      "SESI'OHM": "SESI'OHM es una fuerza de la naturaleza en el escenario psytrance. Mezclando elementos clásicos con producción moderna, su sonido es un poderoso tributo al espíritu de la pista de baile psicodélica.",
      "DASH": "El proyecto de Willyan Gabriel reformula el Progressive Psytrance. Dash estimula al público a vivir cada frecuencia y saltar con total energía.\n\nConectando el Progressive con el Full On agresivo, es la propuesta ideal para las altas horas y festivales majestuosos.",
      "UKACZ": "“Ukacz” es el auténtico proyecto del DJ y productor Marcos Vinicius. Combinando años de experiencia con influencias actuales, trae un enfoque único al House y Tech House.\n\nUkacz entrega sets llenos de personalidad y ritmo, transformando cada evento en una experiencia de pura conexión y energía.",
      "JUNNO": "Residente actual en Santa Catarina, JUNNO es una promesa creada por el DJ y productor Vladimir Junior. Sus pistas únicas combinan ritmos de Tech House y Bass House de manera explosiva.\n\n“DJ Junno” está forjando una trayectoria de gran dinamismo y éxito en la escena.",
      "RISAFFI": "Impulsado por una profunda pasión por el Tech House, su esencia se mueve en sincronía con ritmos cautivadores. Su sonido nace de la conexión entre el ritmo y la energía general.\n\nTransformando esta pasión en creación, entrega sets llenos de fluidez y presencia. Ya sea en clubes o escenarios al aire libre, cada uno de sus shows lleva identidad y calidad.",
      "PIMENTA": "PIMENTA ofrece la energía explosiva del Full On psytrance. Sus sets son un viaje a través de ritmos de alta velocidad y melodías inspiradoras, diseñados para los momentos pico de los festivales.",
      "LEROCK'S": "Con raíces en la escena underground de São Paulo, Lerock’s surgió en 2023 con potentes golpes. Además de DJ, es fundador del Neverland Festival.\n\nEn el estudio transforma sus influencias techno en producciones pesadas y bases hipnóticas. Lerock's no solo controla el deck, sino que lidera la vanguardia del sonido.",
      "BÁRBARA THOMAZ": "Bárbara Thomaz encuentra en la música electrónica la fuerza que impulsa su expresión artística. Percibiendo temprano que el sonido despierta emociones profundas e intensas.\n\nEn el Melodic Techno encuentra el equilibrio perfecto. Cada set es un viaje sensorial diseñado para el alma. En la pista, su trabajo invita al movimiento libre y a la conexión genuina con el presente.",
      "JUNIOR SANT": "Junior Sant, productor y DJ, lleva 15 años explorando las texturas del Techno, Melodic Techno, Indie Dance y Afro House.\n\nNo se apega a fórmulas, dominando tanto los vinilos como el formato digital en presentaciones híbridas que combinan improvisación, sintetizadores y cajas de ritmo para una inmersión estelar.",
      "ELOAH": "El groove es la firma principal de ELOAH—junto a la actitud, presencia y lectura precisa del público. Sus sets fluyen entre Tech House y Minimal, construyendo energía naturalmente con transiciones fluidas.\n\nCada presentación tiene identidad propia. Nada se repite. Eloah entiende la música como conexión y hace que la pista lo sienta en la piel. Donde ella toca, la vibra se transforma.",
      "LACER": "Bajo la guía de Caio Lacerda, el proyecto \"Lacer\" acumula más de 9 años aportando autenticidad a las pistas de todo Brasil.\n\nCon raíces en la House Music y explorando los matices del Tech-House, Lacer transforma cada aparición en un verdadero viaje sonoro, garantizando calidad en sets de calentamiento sutil o de máxima energía.",
      "UMBRA": "Junior Sant, veterano de la música, y Marry, un talento emergente con arrolladora pasión, se unen como Umbra en torno al Melodic Techno.\n\nInspirados por la luz y la oscuridad, sus shows son rituales donde melodías etéreas y beats profundos chocan formando atmósferas oníricas fascinantes.",
      "IZZI": "IZZI aporta una mezcla única de indie dance y acid house al roster. Sus sets son eclécticos y de alta energía, full de giros inesperados y ritmos contagiosos.",
      "BET'S": "BET'S es especialista en tech house minimalista. Su enfoque se trata de los detalles sutiles y el groove perfecto, creando una experiencia hipnótica que cautiva la pista.",
      "GENÊ": "GENÊ es la última incorporación a la familia Ladder Labs, aportando una nueva perspectiva al House y al Indie Dance. Mezclando las bases clásicas del house con las modernas sensibilidades del indie, su sonido es a la vez nostálgico y vanguardista.",
      "IDEMAX": "IDEMAX es una potencia del Full On psytrance. Sus producciones son conocidas por su energía masiva, diseño sonoro cristalino y melodías contagiosas que dominan los escenarios más grandes de los festivales.",
      "CAMPELLO": "CAMPELLO ofrece una experiencia Full On de alto octanaje. Con un enfoque en líneas de bajo contundentes y narrativas psicodélicas, sus sets son un viaje por los momentos álgidos de la experiencia trance.",
      "DAMATA": "El proyecto Forest de DAMATA surge de la conciencia divina, rondando entre 140 y 160 BPM, usando texturas orgánicas e hipnosis pura.\n\nCon estética de ritual, convoca el poder del bosque sónico atrayendo autoexploración e inmersión máxima.",
      "DOTA": "DOTA se especializa en la profundidad emocional del Progressive psytrance. Su música se caracteriza por hermosos build-ups, complejidad melódica y un groove que resuena con la alma.",
      "KORDIE": "KORDIE trae nueva energía a la escena Tech House. Sus sets son una mezcla de baterías contundentes y ganchos pegajosos, diseñados para mantener la energía al máximo y la pista de baile llena.",
      "PITT MALIC": "Pitt Malic ha ganado popularidad veloz gracias a su Psytechno de potentes graves y armonías astutas.\n\nCombinando percusión pura de techno y líneas sintéticas psicodélicas, desata el estado de éxtasis colectivo asegurado en toda pista.",
      "PEDRO TAB": "PEDRO TAB es especialista en Peak Time Techno. Su sonido es implacable, poderoso y sin concesiones, diseñado para los momentos más intensos de la noche en los mejores almacenes del mundo.",
      "WAVEMOON": "WAVEMOON ofrece una experiencia de psytrance cósmico. Su música es una mezcla de narración a alta velocidad y atmósferas celestiais, llevando a la pista de baile a un viaje a través de las estrellas.",
      "NEXUS": "NEXÜS es la cara del Psytrance de Matheus. Nació para conectar emociones compartiendo el escenario en cada canción.\n\nSets con identidad progresiva remarcada y drops alucinantes; Nexus siempre se involucra totalmente y busca la mayor resonancia desde el corazón con todos los espectadores.",
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
export const allArtists = [
  {
    name: "EVVE",
    genre: "Tech House / Minimal",
    genreKeys: ["house", "tech-house", "minimal-deep-tech"],
    image: "/artists/Evve.jpg",
    socials: { instagram: "https://www.instagram.com/evvemusic/", soundcloud: "https://soundcloud.com/evvemusic/tracks", spotify: "#", youtube: "https://www.youtube.com/@evvemusicc/videos" },
    presskit: "https://drive.google.com/drive/u/2/folders/1W8RXPDREOskOMV6HEal5g5Qz4qfDAigf",
    bio: "EVVE is a master of the minimal groove, blending deep tech house textures with surgical precision. Known for hypnotic sets that keep the floor locked in a constant state of motion."
  },
  {
    name: "PAJÔ",
    genre: "Psytrance / Progressive",
    genreKeys: ["psytrance", "progressive-psy"],
    image: "/artists/Pajo.png",
    socials: { instagram: "https://www.instagram.com/pajo.art.br/", soundcloud: "https://soundcloud.com/pajomusic", spotify: "https://open.spotify.com/intl-pt/artist/6adnFJLRZFxvSJ5vhLnyqX", youtube: "https://www.youtube.com/@pajosounds/videos" },
    presskit: "https://drive.google.com/drive/u/5/folders/12xNjFc75ePb73baAqqlwCC6SF5tPROyw",
    bio: "PAJÔ bridges the gap between progressive melodies and powerful psytrance rhythms. His storytelling approach to the dancefloor creates immersive journeys that transcend time and space."
  },
  {
    name: "NRZ",
    genre: "Psytrance / Progressive",
    genreKeys: ["psytrance", "progressive-psy"],
    image: "/artists/NRZ.jpeg",
    socials: { instagram: "https://www.instagram.com/nrzproject_/", soundcloud: "https://soundcloud.com/nrzproject/tracks", spotify: "#", youtube: "#" },
    presskit: "https://drive.google.com/drive/folders/0B-e2Ns8v7KEJYlVPUmpSanlKLTg?resourcekey=0-YsdRYsLNnKmAOyHzlR2Xww",
    bio: "NRZ delivers high-energy progressive beats infused with psychedelic elements. A staple in the festival circuit, his sound is characterized by driving basslines and ethereal atmospheres."
  },
  {
    name: "MOLUSKO",
    genre: "Hi-Tech",
    genreKeys: ["high-bpm", "hi-tech"],
    image: "/artists/Molusko.png",
    socials: { instagram: "https://www.instagram.com/moluskodj/", soundcloud: "https://soundcloud.com/djmolusko", spotify: "#", youtube: "#" },
    presskit: "https://drive.google.com/drive/folders/1YrvTqSXVb9yBgfZLehI2LkPu5cBqBtfl",
    bio: "MOLUSKO is at the forefront of the Hi-Tech movement, pushing the boundaries of speed and sound design. His sets are a masterclass in sonic complexity and relentless energy."
  },
  {
    name: "JUREMA",
    genre: "Dark Psy / Forest",
    genreKeys: ["high-bpm", "dark-psy", "forest"],
    image: "/artists/Jurema.jpg",
    socials: { instagram: "https://www.instagram.com/djjurema/", soundcloud: "https://soundcloud.com/djurema", spotify: "#", youtube: "https://www.youtube.com/@djjurema/videos" },
    presskit: "https://drive.google.com/drive/folders/1ODUa7OCUSNoZTFk2-fku0w7gOWWd8HIJ",
    bio: "JUREMA explores the deepest shadows of the forest, weaving organic textures with dark psychedelic patterns. A true shaman of the night-time dancefloor."
  },
  {
    name: "PRADIM",
    genre: "Tech House / Minimal",
    genreKeys: ["house", "tech-house", "minimal-deep-tech"],
    image: "/artists/Pradim.jpeg",
    socials: { instagram: "https://www.instagram.com/pradim__/", soundcloud: "https://soundcloud.com/felipe-prado-zrm", spotify: "https://open.spotify.com/intl-pt/artist/2ufH7FrNeF629uC3bZGLB5", youtube: "https://www.youtube.com/@Pradim_Music" },
    presskit: "https://www.canva.com/design/DAHCTtv3hZg/Q1gkedgmMJmeTVK_Ukl43w/view",
    bio: "PRADIM brings a sophisticated touch to the tech house scene. His minimal approach emphasizes groove and timing, making him a favorite for intimate club settings and sunrise sets."
  },
  {
    name: "SESI'OHM",
    genre: "Psytrance",
    genreKeys: ["psytrance", "full-on"],
    image: "/artists/Sesi'Ohm.jpg",
    socials: { instagram: "https://www.instagram.com/sesiohmm/", soundcloud: "https://soundcloud.com/sesiohmm", spotify: "#", youtube: "https://www.youtube.com/@sesiohmlive5103" },
    presskit: "https://drive.google.com/drive/u/0/folders/18ip2967Z0RGHFft46aeo7xV98pYTCSdY",
    bio: "SESI'OHM is a force of nature on the psytrance stage. Blending classic elements with modern production, his sound is a powerful tribute to the spirit of the psychedelic dancefloor."
  },
  {
    name: "DASH",
    genre: "Psytrance",
    genreKeys: ["psytrance", "progressive-psy"],
    image: "/artists/Dash.jpeg",
    socials: { instagram: "https://www.instagram.com/dash.music_/", soundcloud: "#", spotify: "#", youtube: "#" },
    presskit: "https://drive.google.com/drive/u/0/folders/18ip2967Z0RGHFft46aeo7xV98pYTCSdY",
    bio: "DASH delivers pure, unadulterated psytrance energy. Known for his dynamic performances and infectious stage presence, he creates a direct connection with the audience through sound."
  },
  {
    name: "UKACZ",
    genre: "House / UK Garage",
    genreKeys: ["house", "uk-garage"],
    image: "/artists/Ukacz.png",
    socials: { instagram: "https://www.instagram.com/ukacz.music/", soundcloud: "https://soundcloud.com/ukaczmusic", spotify: "#", youtube: "#" },
    presskit: "https://drive.google.com/drive/folders/1o_Ts4kdJmOHYLyXeEbHToEOIjFnBGAV-",
    bio: "UKACZ brings the raw energy of the UK underground to the global stage. Blending garage swings with house foundations, his sets are a celebration of rhythm and bass."
  },
  {
    name: "JUNNO",
    genre: "Bass House / Garage House",
    genreKeys: ["house", "bass-house", "garage-house"],
    image: "/artists/Junno.jpg",
    socials: { instagram: "https://www.instagram.com/junnomusic/", soundcloud: "https://soundcloud.com/junnomusic", spotify: "https://open.spotify.com/intl-pt/artist/2kfy2Ut2nR7GW0l2E2wxef", youtube: "https://www.youtube.com/@junnomusicdj/videos" },
    presskit: "https://junnomusic.com.br/",
    bio: "JUNNO is a specialist in heavy basslines and infectious house grooves. His signature sound blends the grit of bass house with the soul of garage, creating high-impact dancefloor moments."
  },
  {
    name: "RISAFFI",
    genre: "Tech House",
    genreKeys: ["house", "tech-house"],
    image: "/artists/Risaffi.jpeg",
    socials: { instagram: "https://www.instagram.com/_risaffi/", soundcloud: "#", spotify: "https://open.spotify.com/intl-pt/artist/52MPLEEOjiJgYyF84X8qyZ", youtube: "#" },
    presskit: "#",
    bio: "RISAFFI is a purveyor of high-quality tech house. His sets are characterized by driving percussion and deep, rolling basslines that keep the energy high from start to finish."
  },
  {
    name: "PIMENTA",
    genre: "Psytrance / Full On",
    genreKeys: ["psytrance", "full-on"],
    image: "/artists/Pimenta.jpeg",
    socials: { instagram: "#", soundcloud: "#", spotify: "#" },
    presskit: "#",
    bio: "PIMENTA delivers the explosive energy of Full On psytrance. His sets are a journey through high-speed rhythms and uplifting melodies, designed for peak-time festival moments."
  },
  {
    name: "LEROCK'S",
    genre: "Melodic Techno",
    genreKeys: ["techno", "melodic-techno"],
    image: "/artists/Lerocks.png",
    socials: { instagram: "https://www.instagram.com/lerocksdj", soundcloud: "#", spotify: "https://open.spotify.com/intl-pt/artist/4ismQ738W44jaS75QdoMyQ?si=IW1yA5nmSc6OiHvuli3n6Q&nd=1&dlsi=257c965860174ae6", youtube: "https://www.youtube.com/@Lerockdj/videos" },
    presskit: "https://lerocks.com.br/",
    bio: "LEROCK'S creates cinematic soundscapes within the melodic techno realm. His music is a balance of emotional depth and warehouse power, taking listeners on a profound sonic voyage."
  },
  {
    name: "BÁRBARA THOMAZ",
    genre: "Melodic Techno",
    genreKeys: ["techno", "melodic-techno"],
    image: "/artists/Bathomaz.png",
    socials: { instagram: "https://www.instagram.com/bathomaz?utm_source=ig_web_button_share_sheet&igsh=MTkxZDZiYWxrNHdoZA%3D%3D", soundcloud: "https://soundcloud.com/dj-barbara-thomaz", spotify: "#", youtube: "https://www.youtube.com/channel/UC15enO2mcWiVxrmDQAjMnCQ" },
    presskit: "https://bathomaz.com.br/",
    bio: "BÁRBARA THOMAZ is a rising star in melodic techno. Her sets are characterized by elegant transitions and a deep understanding of atmosphere, creating a sophisticated club experience."
  },
  {
    name: "JUNIOR SANT",
    genre: "Melodic Techno",
    genreKeys: ["techno", "melodic-techno"],
    image: "/artists/Junior Sant.jpeg",
    socials: { instagram: "https://www.instagram.com/juniorsant_oficial/", soundcloud: "https://soundcloud.com/junior-sant-979249143", spotify: "https://open.spotify.com/user/31pqfmvj2tekcsqr5nckmu2mgtja?si=c7d8d31b85684879&nd=1&dlsi=ca3fe2d41d904563", youtube: "https://www.youtube.com/@djjuniorsant/videos" },
    presskit: "#",
    bio: "JUNIOR SANT blends industrial techno foundations with melodic sensibilities. His sound is powerful yet emotive, perfect for both dark warehouses and open-air festivals."
  },
  {
    name: "ELOAH",
    genre: "Tech House / Minimal",
    genreKeys: ["house", "tech-house", "minimal-deep-tech"],
    image: "/artists/Eloah.jpeg",
    socials: { instagram: "https://www.instagram.com/eloahprieto/", soundcloud: "https://soundcloud.com/eloah-prieto/tracks", spotify: "#", youtube: "#" },
    presskit: "#",
    bio: "ELOAH is a master of the tech house groove. Her sets are a seamless blend of minimal precision and high-energy house, designed to keep the dancefloor moving all night long."
  },
  {
    name: "LACER",
    genre: "Tech House",
    genreKeys: ["house", "tech-house"],
    image: "/artists/Lacer.png",
    socials: { instagram: "https://www.instagram.com/lacermusic/", soundcloud: "#", spotify: "https://open.spotify.com/intl-pt/artist/3c3SUbSwAni69Rae4Y16Eq?si=LmEcl2qpQW2BwpkGPimGYw&nd=1&dlsi=e1d81544dd9f4147", youtube: "https://www.youtube.com/@LacerMusicBR/videos" },
    presskit: "https://presskitpro.app/lacer/",
    bio: "LACER delivers driving tech house with a focus on percussion and energy. His sets are high-impact and relentless, making him a staple of the modern club circuit."
  },
  {
    name: "UMBRA",
    genre: "Melodic Techno",
    genreKeys: ["techno", "melodic-techno"],
    image: "/artists/Umbra.jpeg",
    socials: { instagram: "https://www.instagram.com/umbramusicdj?utm_source=ig_web_button_share_sheet&igsh=MXZ2bm4wMW9iczExNg%3D%3D", soundcloud: "https://soundcloud.com/um-bra-792980200?utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing", spotify: "https://open.spotify.com/user/31p64ytpp6zyeimazaiefp4b26pi", youtube: "#" },
    presskit: "#",
    bio: "UMBRA explores the darker side of melodic techno. His sound is characterized by deep basslines and haunting melodies, creating an immersive and introspective dancefloor experience."
  },
  {
    name: "IZZI",
    genre: "Indie Dance / Acid House",
    genreKeys: ["house", "indie-dance", "acid-house"],
    image: "/artists/Izzi.png",
    socials: { instagram: "https://www.instagram.com/izzibeatmaker/", soundcloud: "#", spotify: "#", youtube: "#" },
    presskit: "#",
    bio: "IZZI brings a unique blend of indie dance and acid house to the roster. Her sets are eclectic and high-energy, full of unexpected twists and infectious rhythms."
  },
  {
    name: "BET'S",
    genre: "Tech House / Minimal",
    genreKeys: ["house", "tech-house", "minimal-deep-tech"],
    image: "/artists/Bets.jpeg",
    socials: { instagram: "https://www.instagram.com/humbertohct/", soundcloud: "#", spotify: "#", youtube: "#" },
    presskit: "#",
    bio: "BET'S is a specialist in minimal tech house. Her approach is all about the subtle details and the perfect groove, creating a hypnotic experience that captivates the floor."
  },
  {
    name: "GENÊ",
    genre: "House / Indie Dance",
    genreKeys: ["house", "indie-dance"],
    image: "/artists/GENÊ.png",
    socials: { instagram: "https://www.instagram.com/gabrielgene_/", soundcloud: "https://soundcloud.com/gabriel-gene/tracks", spotify: "#", youtube: "#" },
    presskit: "#",
    bio: "GENÊ is the latest addition to the Ladder Labs family, bringing a fresh perspective on House and Indie Dance. Blending classic house foundations with modern indie sensibilities, his sound is both nostalgic and forward-thinking."
  },
  {
    name: "IDEMAX",
    genre: "Full On",
    genreKeys: ["psytrance", "full-on"],
    image: "/artists/Idemax.jpg",
    socials: { instagram: "https://www.instagram.com/idemax/", soundcloud: "https://soundcloud.com/idemax", spotify: "https://open.spotify.com/intl-pt/artist/6jp5aN5ze1ysiSJh61oMCx", youtube: "https://www.youtube.com/channel/UCsyBTwoIMSABNe_UQ54XNQA" },
    presskit: "https://www.idemax.net/",
    bio: "IDEMAX is a powerhouse of Full On psytrance. His productions are known for their massive energy, crystal-clear sound design, and infectious melodies that dominate the largest festival stages."
  },
  {
    name: "CAMPELLO",
    genre: "Full On",
    genreKeys: ["psytrance", "full-on"],
    image: "/artists/Campello.jpg",
    socials: { instagram: "https://www.instagram.com/camp3llo_live/", soundcloud: "https://soundcloud.com/andre-campello-1655472", spotify: "https://open.spotify.com/intl-pt/artist/1hvS5nKXwPxi7FZCG2vzrk?si=xWVj237UQJW8Tk3rh3dklQ&nd=1&dlsi=f26288b435b94442", youtube: "https://www.youtube.com/channel/UC5yFCDz-pchH_jm-rujgHjA" },
    presskit: "https://drive.google.com/drive/folders/1pLGzFQfsB5ZOXIZ8wZVGyT2DQilPQ7Fi",
    bio: "CAMPELLO delivers a high-octane Full On experience. With a focus on driving basslines and psychedelic storytelling, his sets are a journey through the peak moments of the trance experience."
  },
  {
    name: "DAMATA",
    genre: "Forest",
    genreKeys: ["high-bpm", "forest"],
    image: "/artists/Damata.png",
    socials: { instagram: "https://www.instagram.com/damata_music/", soundcloud: "https://audius.co/damatamusic", spotify: "#", youtube: "#" },
    presskit: "https://drive.google.com/drive/folders/1oVQqclwtEZHTlQOSYXx9e0mQKYrpoB-L",
    bio: "DAMATA is a master of the Forest sound. Weaving organic textures with deep, hypnotic rhythms, he creates a sonic atmosphere that transports listeners to the heart of the ancient woods."
  },
  {
    name: "DOTA",
    genre: "Progressive",
    genreKeys: ["psytrance", "progressive-psy"],
    image: "/artists/Dota.jpg",
    socials: { instagram: "https://www.instagram.com/_djdota/", soundcloud: "#", spotify: "#", youtube: "#" },
    presskit: "#",
    bio: "DOTA specializes in the emotional depth of Progressive psytrance. His music is characterized by beautiful build-ups, melodic complexity, and a groove that resonates with the soul."
  },
  {
    name: "KORDIE",
    genre: "Tech House",
    genreKeys: ["house", "tech-house"],
    image: "/artists/Kordie.jpeg",
    socials: { instagram: "#", soundcloud: "#", spotify: "#" },
    presskit: "#",
    bio: "KORDIE brings a fresh energy to the Tech House scene. His sets are a blend of punchy drums and catchy hooks, designed to keep the energy high and the dancefloor packed."
  },
  {
    name: "PITT MALIC",
    genre: "Psytechno",
    genreKeys: ["techno", "psytechno"],
    image: "/artists/Pitt Malic.jpeg",
    socials: { instagram: "https://www.instagram.com/djpittmalic/", soundcloud: "#", spotify: "#", youtube: "#" },
    presskit: "#",
    bio: "PITT MALIC explores the intersection of Techno and Psychedelia. His Psytechno sets are dark, driving, and full of mind-bending textures that challenge the boundaries of conventional techno."
  },
  {
    name: "PEDRO TAB",
    genre: "Techno / Peak Time",
    genreKeys: ["techno", "peak-time"],
    image: "/artists/Tab.png",
    socials: { instagram: "https://www.instagram.com/pedrotabsounds/", soundcloud: "https://soundcloud.com/pedrotab/tracks", spotify: "#", youtube: "#" },
    presskit: "#",
    bio: "PEDRO TAB is a specialist in Peak Time Techno. His sound is relentless, powerful, and uncompromising, designed for the most intense moments of the night in the world's best warehouses."
  },
  {
    name: "WAVEMOON",
    genre: "Psytrance",
    genreKeys: ["psytrance", "full-on"],
    image: "/artists/Wavemoon.jpeg",
    socials: { instagram: "https://www.instagram.com/wavemoonoficial/", soundcloud: "https://soundcloud.com/wavemoonlive/popular-tracks", spotify: "#", youtube: "#" },
    presskit: "#",
    bio: "WAVEMOON delivers a cosmic psytrance experience. His music is a blend of high-speed storytelling and celestial atmospheres, taking the dancefloor on a journey through the stars."
  },
  {
    name: "NEXUS",
    genre: "Progressive",
    genreKeys: ["psytrance", "progressive-psy"],
    image: "/artists/Nexus.jpeg",
    socials: { instagram: "https://www.instagram.com/nexus_dj__/", soundcloud: "https://soundcloud.com/matheus-has14/tracks", spotify: "https://open.spotify.com/intl-pt/artist/62lrgPgbORAV5jI6zOZ2wS?si=GZ2cFs7aTvK0NXPKkC6i-g&utm_source=ig&utm_medium=social&utm_content=link_in_bio&fbclid=PAZXh0bgNhZW0CMTEAc3J0YwZhcHBfaWQMMjU2MjgxMDQwNTU4AAGn4QutYs8Ij2Kcr-H7VOCPtngVkML0GRNK0M3FKK9N52OyiKp89nBXStGoiLA_aem_Pvm399AismO4TJoLkeWk9g&nd=1&dlsi=e850983bae1a45b4", youtube: "#" },
    presskit: "#",
    bio: "NEXUS is a master architect of Progressive psytrance. His music takes listeners on a deep emotional journey, with layered melodies and powerful grooves that build slowly toward transcendent peak moments."
  },
  {
    name: "BAZZE",
    genre: "House / Tech House",
    genreKeys: ["house", "tech-house"],
    image: "/artists/Default.png",
    socials: { instagram: "https://www.instagram.com/bazze.art/", soundcloud: "#", spotify: "#", youtube: "#" },
    presskit: "#",
    bio: "BAZZE is a rising talent, bringing a fresh perspective to the dancefloor with an infectious groove and deep atmosphere."
  }
];

// --- Components ---

// --- Helper Components ---

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
  const [selectedMainGenre, setSelectedMainGenre] = useState<MainGenre | null>(null);
  const [selectedSubGenre, setSelectedSubGenre] = useState<string | null>(null);
  const [isSubgenreOpen, setIsSubgenreOpen] = useState(false);
  const [activeArtist, setActiveArtist] = useState<any | null>(null);
  const [isSecureGateOpen, setIsSecureGateOpen] = useState(false);
  const [securePassword, setSecurePassword] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [statusIndex, setStatusIndex] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [prefilledArtist, setPrefilledArtist] = useState("");
  const [rosterView, setRosterView] = useState<"main" | "guests">("main");

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

  const getFilteredArtists = () => {
    const baseList = allArtists.filter(a => a.image !== "" && a.name !== "NRZ");

    if (rosterView === "guests") {
      return [];
    }

    return baseList.filter(artist => {
      // Rule 1: Match Main Genre
      if (selectedMainGenre) {
        // Find if artist genreKeys include the main genre key itself OR any of its subgenres
        const validKeysForMain = [
          selectedMainGenre,
          ...(SUBGENRES[selectedMainGenre]?.map(sub => sub.id) || [])
        ];

        const matchesMain = artist.genreKeys?.some(key => validKeysForMain.includes(key));
        if (!matchesMain) return false;
      }

      // Rule 2: Match Subgenre
      if (selectedSubGenre) {
        const matchesSub = artist.genreKeys?.includes(selectedSubGenre);
        if (!matchesSub) return false;
      }

      return true;
    });
  };

  const filteredArtists = getFilteredArtists();
  const nrzArtist = allArtists.find(a => a.name === "NRZ");

  const handleAuth = () => {
    if (securePassword.trim() === "ravenaescada") {
      setIsAuthorized(true);
      setAuthError(false);
      setIsSecureGateOpen(false);
      setSecurePassword(""); // Clear on success
      // Store session for 30 mins
      localStorage.setItem("ladder_auth", (Date.now() + 30 * 60 * 1000).toString());
    } else {
      setAuthError(true);
      setSecurePassword(""); // Clear on failure too for security/retry
      setTimeout(() => setAuthError(false), 2000);
    }
  };

  useEffect(() => {
    const session = localStorage.getItem("ladder_auth");
    if (session && parseInt(session) > Date.now()) {
      setIsAuthorized(true);
    }
  }, []);
  const handleMainGenreClick = (genreKey: MainGenre) => {
    setIsSubgenreOpen(false);
    if (selectedMainGenre === genreKey) {
      // Toggle off if clicking the active one
      setSelectedMainGenre(null);
      setSelectedSubGenre(null);
      document.body.style.setProperty("--bg-shift", "#0B0B0F");
    } else {
      setSelectedMainGenre(genreKey);
      setSelectedSubGenre(null); // Reset subgenre when main changes

      // Apply subtle background shift based on main genre
      const baseColors: Record<MainGenre, string> = {
        house: "#0B1015",
        techno: "#100B15",
        psytrance: "#0B1512",
        "high-bpm": "#15120B",
      };

      document.body.style.setProperty("--bg-shift", baseColors[genreKey] || "#0B0B0F");
    }

    if (artistsRef.current) {
      artistsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleSubGenreClick = (subId: string) => {
    setSelectedSubGenre(subId === selectedSubGenre ? null : subId);
  };

  const clearAllFilters = () => {
    setSelectedMainGenre(null);
    setSelectedSubGenre(null);
    setIsSubgenreOpen(false);
    document.body.style.setProperty("--bg-shift", "#0B0B0F");
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
        <nav className={`fixed top-0 w-full z-50 px-4 md:px-6 grid grid-cols-[auto_1fr_auto] lg:grid-cols-3 items-center transition-all duration-500 ${scrolled ? "glass-panel border-b border-white/10 py-3 shadow-[0_8px_40px_rgba(0,0,0,0.6)]" : "bg-transparent border-b border-transparent py-6"}`}>
          <div className="flex items-center gap-1.5 md:gap-4 shrink-0 overflow-hidden justify-self-start">
            <div className="flex items-center gap-1.5 md:gap-3 shrink-0">
              <motion.div
                whileHover={{ rotate: 135 }}
                className="w-4 h-4 md:w-8 md:h-8 bg-gradient-to-br from-brand-cyan to-brand-pink rounded-sm rotate-45 flex items-center justify-center cursor-pointer shrink-0"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                <div className="w-1.5 md:w-4 h-0.5 bg-white -rotate-45" />
              </motion.div>
              <span className="font-display font-bold text-[11px] md:text-xl tracking-tighter shrink-0 whitespace-nowrap">
                LADDER<span className="text-gradient">LABS</span>
              </span>
            </div>

            {/* Neverland Logo in Header - Only show when scrolled to reduce redundancy */}
            <AnimatePresence>
              {scrolled && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-center gap-1.5 md:gap-3 shrink-0"
                >
                  <div className="h-3 md:h-6 w-px bg-white/10 shrink-0 mx-1 md:mx-0" />
                  <img
                    src="/logos/neverland-records.webp"
                    alt="Neverland Records"
                    className="h-2.5 md:h-8 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity shrink-0"
                    referrerPolicy="no-referrer"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="hidden lg:flex items-center justify-center gap-8 justify-self-center">
            <div className="flex gap-8 text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">
              <a href="#roster" className="hover:text-brand-cyan transition-colors">{t.nav.artists}</a>
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

          <div className="flex items-center justify-end gap-3 md:gap-6 min-w-0 flex-1">
            <div className="lang-toggle !hidden sm:!flex">
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
              className="hidden lg:block px-5 py-2 bg-white text-brand-dark text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-brand-cyan transition-all btn-glow"
            >
              {t.nav.bookNow}
            </a>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden w-10 h-10 flex items-center justify-center text-white bg-white/5 rounded-full border border-white/10 z-[60]"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-0 bg-brand-dark z-[55] flex flex-col p-8 pt-32"
            >
              <div className="flex flex-col gap-8">
                {[
                  { name: t.nav.artists, href: "#roster" },
                  { name: "Radar", href: "#radar" },
                  { name: t.nav.about, href: "#about" },
                  { name: t.nav.booking, href: "#booking" }
                ].map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="font-display text-4xl font-bold tracking-tighter hover:text-brand-cyan transition-colors"
                  >
                    {item.name}
                  </a>
                ))}
              </div>

              <div className="mt-auto space-y-8">
                <div className="flex gap-4">
                  {(["EN", "PT", "ES"] as Language[]).map((l) => (
                    <button
                      key={l}
                      onClick={() => setLang(l)}
                      className={`px-4 py-2 rounded-lg border border-white/10 text-[10px] font-bold ${lang === l ? "bg-white text-brand-dark" : "text-white/50"}`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
                <a
                  href="#booking"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full py-5 bg-white text-brand-dark text-center font-bold uppercase tracking-widest rounded-2xl btn-glow"
                >
                  {t.nav.bookNow}
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
              className="flex flex-row items-center justify-center gap-4 md:gap-16 mb-12 md:mb-16"
            >
              <img
                src="/logos/ladder-labs.png"
                alt="Ladder Labs"
                className="h-10 md:h-36 w-auto logo-metallic"
                referrerPolicy="no-referrer"
              />
              <div className="h-8 md:h-16 w-px bg-white/10 mx-2 md:mx-4" />
              <img
                src="/logos/neverland-records.webp"
                alt="Neverland Records"
                className="h-6 md:h-20 w-auto logo-metallic opacity-80"
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
              className="text-white/50 max-w-2xl mx-auto mb-12 font-light leading-relaxed text-sm md:text-base"
            >
              Ladder Labs representa a próxima geração de artistas de música eletrônica. Arquitetos de experiências imersivas na pista de dança.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <a href="#roster" className="px-10 py-5 bg-white text-brand-dark font-bold uppercase tracking-widest rounded-full hover:bg-brand-cyan transition-all hover:scale-105 btn-glow flex items-center justify-center gap-2">
                <span className="text-[10px]">✦</span> Explorar Roster
              </a>
              <a href="#radar" className="px-10 py-5 border border-white/20 text-white font-bold uppercase tracking-widest rounded-full hover:bg-white/5 transition-all flex justify-center items-center gap-2">
                Radar de Eventos
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

        {/* Roster & Discovery Section */}
        <section id="roster" ref={artistsRef} className="py-24 md:py-32 relative overflow-hidden bg-black/20">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 md:mb-16 gap-8">
              <div className="max-w-xl">
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-brand-cyan text-[10px] font-bold uppercase tracking-[0.5em] block">
                    {rosterView === "main" ? t.roster.tag : "GUEST ARTISTS"}
                  </span>
                  <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                    <span className="text-[8px] font-bold uppercase tracking-widest text-white/50">
                      Showing {filteredArtists.length} Artists
                    </span>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4 mb-8 w-full max-w-2xl">
                  <button
                    onClick={() => setRosterView("main")}
                    className={`flex-1 py-4 md:py-6 rounded-2xl font-display font-bold text-xl md:text-3xl tracking-tighter transition-all border ${rosterView === "main"
                      ? "bg-brand-cyan text-brand-dark border-brand-cyan shadow-[0_0_30px_rgba(0,255,255,0.2)]"
                      : "bg-white/5 text-white/50 border-white/10 hover:bg-white/10 hover:text-white"
                      }`}
                  >
                    LADDER LABS <span className="text-white/30 font-light mx-2">/</span> NEVERLAND RECORDS
                  </button>
                  <button
                    onClick={() => setRosterView("guests")}
                    className={`flex-1 py-4 md:py-6 rounded-2xl font-display font-bold text-xl md:text-3xl tracking-tighter transition-all border ${rosterView === "guests"
                      ? "bg-brand-pink text-white border-brand-pink shadow-[0_0_30px_rgba(238,42,123,0.2)]"
                      : "bg-white/5 text-white/50 border-white/10 hover:bg-white/10 hover:text-white"
                      }`}
                  >
                    ARTISTAS CONVIDADOS
                  </button>
                </div>

                {/* Taxonomy Filter System */}
                <div className="flex flex-col gap-6 w-full lg:w-3/4">
                  {/* Layer 1 - Main Genres & Subgenres */}
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={clearAllFilters}
                      className={`px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all border ${!selectedMainGenre && !selectedSubGenre
                        ? 'bg-brand-cyan text-brand-dark border-brand-cyan shadow-[0_0_15px_rgba(0,255,255,0.3)]'
                        : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10 hover:text-white'
                        }`}
                    >
                      Todos
                    </button>

                    {/* Layer 1: Main Genres */}
                    {Object.entries(MAIN_GENRES).map(([key, name]) => (
                      <button
                        key={key}
                        onClick={() => handleMainGenreClick(key as MainGenre)}
                        className={`px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all border ${selectedMainGenre === key
                          ? 'bg-white text-brand-dark border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                          : 'bg-black/40 text-white/70 border-white/10 hover:bg-white/10 hover:text-white'
                          }`}
                      >
                        {name}
                      </button>
                    ))}
                  </div>

                  {/* Layer 2 - Subgenres Dropdown */}
                  <div className="relative mt-2 w-full max-w-sm">
                    <button
                      onClick={() => setIsSubgenreOpen(!isSubgenreOpen)}
                      className="w-full flex items-center justify-between px-5 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">
                        {selectedSubGenre
                          ? Object.values(SUBGENRES).flat().find(s => s.id === selectedSubGenre)?.name
                          : "Filtrar por Subvertente..."}
                      </span>
                      <ChevronDown size={14} className={`text-white/50 transition-transform ${isSubgenreOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {isSubgenreOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute z-50 mt-2 w-full bg-[#0B0B0F] border border-white/10 rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.8)] overflow-hidden"
                        >
                          <div className="max-h-64 overflow-y-auto custom-scrollbar p-2 flex flex-col gap-1">
                            <button
                              onClick={() => { setSelectedSubGenre(null); setIsSubgenreOpen(false); }}
                              className={`text-left px-4 py-3 rounded-lg text-[9px] font-bold uppercase tracking-[0.2em] transition-all cursor-pointer ${!selectedSubGenre ? 'bg-brand-cyan/10 text-brand-cyan' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}
                            >
                              Todas as Subvertentes
                            </button>
                            {(selectedMainGenre ? SUBGENRES[selectedMainGenre] || [] : Object.values(SUBGENRES).flat()).map(sub => (
                              <button
                                key={sub.id}
                                onClick={() => { handleSubGenreClick(sub.id); setIsSubgenreOpen(false); }}
                                className={`text-left px-4 py-3 rounded-lg text-[9px] font-bold uppercase tracking-[0.2em] transition-all cursor-pointer ${selectedSubGenre === sub.id
                                  ? 'bg-brand-cyan/10 text-brand-cyan'
                                  : 'text-white/50 hover:bg-white/5 hover:text-white'
                                  }`}
                              >
                                {sub.name}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end justify-between gap-4">
                <p className="text-white/30 max-w-xs text-[10px] uppercase tracking-[0.2em] leading-relaxed font-medium text-right hidden lg:block">
                  {t.roster.subtitle}
                </p>
                {(selectedMainGenre || selectedSubGenre) && (
                  <button
                    onClick={clearAllFilters}
                    className="text-[9px] font-bold uppercase tracking-widest text-brand-cyan hover:text-white transition-colors flex items-center gap-2"
                  >
                    <X size={12} /> LIMPAR FILTRO
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
                    className="relative rounded-2xl border border-white/5 bg-white/[0.02] group cursor-pointer hover-step"
                    onClick={() => setActiveArtist(artist)}
                  >
                    <HUDCorners />
                    <div className="aspect-[3/4] overflow-hidden relative rounded-2xl">
                      <img
                        src={artist.image}
                        alt={artist.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover grayscale-0 md:grayscale md:group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
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

            {/* Empty State for Guests */}
            {rosterView === "guests" && filteredArtists.length === 0 && (
              <div className="py-10"></div>
            )}

            {/* Exclusive NRZ / Devil Company Section */}
            {rosterView === "guests" && nrzArtist && (
              <div className="mt-32 pt-20 border-t border-white/10 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black px-6 text-brand-pink font-bold text-[10px] uppercase tracking-[0.4em]">
                  Exclusive Partnership
                </div>

                <div className="flex flex-col lg:flex-row items-center gap-12 bg-white/[0.02] border border-white/5 rounded-3xl p-8 md:p-12 relative overflow-hidden group">
                  <div className="absolute right-0 top-0 -mr-20 -mt-20 w-64 h-64 bg-red-600/10 blur-[100px] rounded-full pointer-events-none" />

                  <div
                    onClick={() => setActiveArtist(nrzArtist)}
                    className="w-full lg:w-1/3 aspect-[3/4] md:aspect-square lg:aspect-[3/4] rounded-2xl overflow-hidden relative border border-white/10 cursor-pointer"
                  >
                    <img
                      src={nrzArtist.image}
                      alt={nrzArtist.name}
                      loading="lazy"
                      className="w-full h-full object-cover grayscale-0 md:grayscale md:group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90" />
                    <div className="absolute bottom-6 left-6">
                      <span className="text-brand-cyan text-[9px] font-bold uppercase tracking-[0.3em] mb-1 block">
                        {nrzArtist.genre}
                      </span>
                      <span className="text-brand-pink text-[9px] font-bold uppercase tracking-[0.3em] mb-2 block">
                        Devil Company Exclusive
                      </span>
                      <h3 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-white/90">NRZ</h3>
                    </div>
                  </div>

                  <div className="w-full lg:w-2/3 flex flex-col justify-center">
                    <div className="flex items-center gap-4 mb-6">
                      <img src="/logos/devil-logo.jpg" className="w-14 h-14 rounded-full object-cover shadow-lg border border-brand-pink/20" alt="Devil Company" />
                      <div>
                        <h4 className="font-bold text-white tracking-widest uppercase text-xs">Devil Company</h4>
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.2em]">Management & Booking</p>
                      </div>
                    </div>

                    <p className="text-white/60 font-light leading-relaxed mb-8 text-lg">
                      NRZ é um artista exclusivo da Devil Company. A Ladder Labs atua em parceria estratégica para a amplificação de sua frequência no circuito underground. Todas as negociações e bookings devem ser tratadas diretamente com a Devil Company.
                    </p>

                    <div className="flex flex-wrap gap-4">
                      <a
                        href="https://www.instagram.com/devilcompany_br"
                        target="_blank"
                        rel="noreferrer"
                        className="px-8 py-4 bg-brand-pink/10 hover:bg-brand-pink border border-brand-pink/30 hover:border-brand-pink text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(238,42,123,0.1)] flex items-center gap-3"
                      >
                        <Instagram size={16} /> Contato Devil Company
                      </a>
                      <button
                        onClick={(e) => { e.stopPropagation(); setActiveArtist(nrzArtist); }}
                        className="px-8 py-4 border border-white/10 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all"
                      >
                        Ver Perfil Completo
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
        <EventRadar
          t={t.radar}
          isAuthorized={isAuthorized}
          onGateRequest={() => setIsSecureGateOpen(true)}
        />

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
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-brand-cyan/10 rounded-full flex items-center justify-center mx-auto mb-8 text-brand-cyan">
                          <Activity size={32} />
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
                            <option value="500-2000" className="bg-brand-dark">{t.booking.budgetOptions.tier1}</option>
                            <option value="2000-5000" className="bg-brand-dark">{t.booking.budgetOptions.tier2}</option>
                            <option value="5000-15000" className="bg-brand-dark">{t.booking.budgetOptions.tier3}</option>
                            <option value="15000-30000" className="bg-brand-dark">{t.booking.budgetOptions.tier4}</option>
                            <option value="30000+" className="bg-brand-dark">{t.booking.budgetOptions.tier5}</option>
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

      {/* Secure Event Gate Modal */}
      <AnimatePresence>
        {isSecureGateOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSecureGateOpen(false)}
              className="fixed inset-0 bg-black/90 backdrop-blur-md z-[9998]"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center z-[9999] p-6 pointer-events-none"
            >
              <div className={`glass-panel p-12 rounded-[2rem] max-w-sm w-full relative transition-all duration-300 pointer-events-auto ${authError ? "border-red-500/50 shadow-[0_0_50px_rgba(239,68,68,0.2)]" : "border-brand-cyan/30 shadow-[0_0_50px_rgba(0,242,255,0.1)]"}`}>
                <HUDCorners />
                <div className="text-center mb-8">
                  <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center bg-white/5 ${authError ? "text-red-500" : "text-brand-cyan"}`}>
                    <Activity size={32} />
                  </div>
                  <h3 className="font-display text-xl font-bold uppercase tracking-widest mb-2">Access Gate</h3>
                  <p className="text-white/40 text-[10px] uppercase tracking-[0.2em]">Enter Intelligence Frequency</p>
                </div>

                <div className="space-y-6">
                  <div className="relative">
                    <input
                      type="password"
                      value={securePassword}
                      onChange={(e) => setSecurePassword(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAuth()}
                      className={`w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 focus:outline-none focus:border-brand-cyan transition-colors text-center font-mono tracking-widest text-lg ${authError ? "text-red-500 border-red-500/50" : ""}`}
                      placeholder="••••••••"
                      autoFocus
                    />
                    {authError && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute -bottom-6 left-0 w-full text-center text-[8px] text-red-500 font-bold uppercase tracking-widest"
                      >
                        Invalid Frequency - Access Denied
                      </motion.div>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setIsSecureGateOpen(false)}
                      className="flex-1 px-4 py-4 border border-white/10 text-white/50 text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-white/5 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAuth}
                      className="flex-2 flex-[2] px-4 py-4 bg-brand-cyan text-brand-dark text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-white transition-all btn-glow"
                    >
                      Authorize
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>



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
                  <p className="text-white/60 text-lg font-light leading-relaxed whitespace-pre-line">
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

      {/* Communication Actions — Global */}
      <div className="fixed top-24 md:top-36 right-4 md:right-8 z-40 flex flex-col gap-3">
        <a
          href="#radar"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById("radar")?.scrollIntoView({ behavior: "smooth" });
          }}
          className="w-10 h-10 md:w-12 md:h-12 bg-brand-cyan rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,255,255,0.3)] hover:scale-110 transition-transform"
          aria-label="Radar de Eventos"
        >
          <Activity className="w-4 h-4 md:w-5 md:h-5 text-brand-dark" />
        </a>
        <a
          href="https://www.instagram.com/ladder.labs/"
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
          aria-label="Instagram"
        >
          <Instagram className="w-4 h-4 md:w-5 md:h-5 text-white" />
        </a>
        <a
          href={`https://wa.me/5531972409183?text=${encodeURIComponent("Olá! Quero fazer um booking pela Ladder Labs.")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 md:w-12 md:h-12 bg-[#25D366] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(37,211,102,0.4)] hover:scale-110 transition-transform"
          aria-label="WhatsApp Booking"
        >
          <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4 md:w-5 md:h-5">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </a>
      </div>

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
