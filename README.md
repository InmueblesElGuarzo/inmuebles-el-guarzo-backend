<p align="center">
  <img src="./assets/banner/banner.png" alt="Inmuebles El Guarzo Banner"/>
</p>

<br>

<h1 align="center">Inmuebles El Guarzo</h1>

<p align="center">
  Plataforma backend inmobiliaria moderna desarrollada con arquitectura escalable y enfoque cloud-native.
</p>

<p align="center">

  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white"/>

  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white"/>

  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white"/>

  <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white"/>

  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white"/>

</p>

---

# Información del documento

| Campo       | Información                     |
| ----------- | ------------------------------- |
| Proyecto    | Inmuebles El Guarzo             |
| Versión     | 1.0                             |
| Año         | 2026                            |
| Universidad | Universidad Católica de Oriente |
| Asignatura  | Ingeniería de Software 2        |

---

# Integrantes del equipo

| Integrante               | Rol               |
| ------------------------ | ----------------- |
| Samuel Giraldo Villada   | Backend Developer |
| Juan Camilo Urrea Garcia | Backend Developer |

---

# Tabla de contenido

- [Objetivo del documento](#objetivo-del-documento)
- [1. Descripción general del proyecto](#1-descripción-general-del-proyecto)
- [2. Arquitectura del sistema](#2-arquitectura-del-sistema)
- [3. Restricciones técnicas](#3-restricciones-técnicas)
- [4. Restricciones de negocio](#4-restricciones-de-negocio)
- [5. Atributos de calidad](#5-atributos-de-calidad)
- [6. Funcionalidades críticas del sistema](#6-funcionalidades-críticas-del-sistema)
- [7. Tácticas y estrategias arquitectónicas](#7-tácticas-y-estrategias-arquitectónicas)
- [8. Arquetipo de solución](#8-arquetipo-de-solución)
- [9. Arquitectura de solución](#9-arquitectura-de-solución)
- [10. Diagramas de componentes](#10-diagramas-de-componentes)
- [11. Diagramas de paquetes](#11-diagramas-de-paquetes)

---

# Objetivo del documento

El presente documento tiene como propósito describir la arquitectura de software definida para la plataforma Inmuebles El Guarzo, incluyendo decisiones de diseño, restricciones, atributos de calidad, componentes arquitectónicos y estrategias adoptadas durante el desarrollo del sistema.

Asimismo, busca servir como referencia técnica para comprender la estructura general de la solución, facilitar su evolución futura y respaldar las decisiones arquitectónicas tomadas durante el proyecto.

---

# 1. Descripción general del proyecto

## 1.1. Contexto y problemática

Inmuebles El Guarzo surge como respuesta a las dificultades que enfrentan muchas personas al buscar inmuebles mediante redes sociales, publicaciones dispersas o plataformas desconectadas, donde la información suele ser inconsistente, limitada o difícil de verificar.

Actualmente, gran parte de la gestión inmobiliaria continúa realizándose de manera manual o mediante herramientas poco integradas, dificultando la trazabilidad de procesos, la atención de clientes y la administración eficiente de propiedades.

---

## 1.2. Objetivo de la plataforma

El objetivo del proyecto es desarrollar una plataforma inmobiliaria moderna que permita centralizar, gestionar y optimizar la publicación y consulta de propiedades, ofreciendo una experiencia más organizada, segura y escalable tanto para clientes como para asesores inmobiliarios.

La plataforma permite administrar propiedades, gestionar ofertas, procesar solicitudes de publicación, manejar contactos y centralizar la comunicación mediante distintos canales digitales.

Además del enfoque funcional del negocio inmobiliario, el sistema fue diseñado siguiendo principios modernos de arquitectura de software, priorizando mantenibilidad, escalabilidad, seguridad y evolución tecnológica.

---

# 2. Arquitectura del sistema

## 2.1. Enfoque arquitectónico

El backend de Inmuebles El Guarzo fue diseñado bajo un enfoque de Monolito Modular complementado con principios de Clean Architecture.

Esta decisión arquitectónica responde directamente a las necesidades reales del negocio, al alcance actual del proyecto y a la necesidad de mantener una base de código mantenible, desacoplada y preparada para evolucionar progresivamente.

---

## 2.2. ¿Por qué un Monolito Modular?

El sistema maneja procesos altamente relacionados entre sí, como:

- Gestión de propiedades.
- Publicaciones inmobiliarias.
- Ofertas.
- Contactos.
- Notificaciones.
- Auditoría.
- Autenticación y autorización.

Debido a esta alta cohesión del dominio, se optó por un Monolito Modular, ya que permite:

- Mantener una única unidad de despliegue.
- Reducir complejidad operativa.
- Evitar problemas de comunicación distribuida.
- Garantizar consistencia transaccional.
- Facilitar el mantenimiento del sistema.
- Organizar el proyecto mediante módulos desacoplados.

A diferencia de una arquitectura de microservicios, este enfoque evita introducir complejidad temprana relacionada con orquestación, observabilidad distribuida, comunicación entre servicios y administración de infraestructura adicional.

Además, la separación modular del sistema deja preparada la aplicación para una posible migración futura hacia microservicios, debido a que los límites del dominio ya se encuentran claramente definidos.

---

## 2.3. Uso de Clean Architecture

Sobre el monolito modular se implementó Clean Architecture, propuesta por Robert C. Martin (Uncle Bob).

Esta arquitectura permite separar las reglas de negocio de los detalles técnicos y de infraestructura, promoviendo un diseño desacoplado y mantenible.

Cada módulo se divide en capas claramente definidas:

| Capa             | Responsabilidad                   |
| ---------------- | --------------------------------- |
| `domain`         | Reglas y entidades del negocio    |
| `application`    | Casos de uso y orquestación       |
| `infrastructure` | Persistencia y servicios externos |
| `presentation`   | Exposición HTTP y controladores   |

<p align="center">
  <img
    src="./assets/architecture/clean-architecture.png"
    width="700"
    alt="Clean Architecture"
  />
</p>

<p align="center">
  Representación conceptual de Clean Architecture propuesta por Robert C. Martin.
</p>

---

## 2.4. Motivadores arquitectónicos

Las decisiones arquitectónicas del proyecto estuvieron guiadas por los siguientes motivadores:

| Motivador               | Impacto en el diseño                                  |
| ----------------------- | ----------------------------------------------------- |
| Mantenibilidad          | Organización modular y separación por capas           |
| Escalabilidad evolutiva | Crecimiento progresivo por dominios                   |
| Seguridad               | Integración centralizada de autenticación y auditoría |
| Desacoplamiento         | Uso de puertos y adaptadores                          |
| Testabilidad            | Casos de uso independientes de infraestructura        |
| Evolución tecnológica   | Independencia de frameworks y proveedores externos    |
| Claridad organizacional | Estructura consistente y predecible                   |

---

## 2.5. Estructura general del backend

```text
src/
 ├── modules/
 │    ├── properties/
 │    ├── offers/
 │    ├── contacts/
 │    ├── publications/
 │    ├── notifications/
 │    ├── iam/
 │    └── ...
 │
 ├── shared-kernel/
 │
 ├── app.module.ts
 └── main.ts
```

---

# 3. Restricciones técnicas

## 3.1. Definición e impacto en el diseño

Las restricciones técnicas representan el conjunto de condiciones, estándares y lineamientos que limitan o guían las decisiones de diseño, desarrollo y despliegue del sistema.

Estas restricciones permiten garantizar que la solución cumpla criterios mínimos de:

- Calidad de software
- Seguridad
- Escalabilidad
- Mantenibilidad
- Observabilidad
- Automatización
- Rendimiento operativo

En el contexto de Inmuebles El Guarzo, las restricciones técnicas influyen directamente en la arquitectura del sistema, la selección de tecnologías, la organización del código, las prácticas DevOps y la estrategia de aseguramiento de calidad.

Además, estas restricciones permiten establecer estándares consistentes de desarrollo que facilitan la evolución progresiva del proyecto y reducen riesgos técnicos durante el ciclo de vida del software.

---

## 3.2. Restricciones de prácticas DevOps

Esta categoría agrupa las restricciones relacionadas con automatización de despliegues, integración continua, estabilidad operativa y estrategias de entrega del software.

| Restricción                          | Justificación                                              |
| ------------------------------------ | ---------------------------------------------------------- |
| Implementación de CI/CD automatizado | Garantiza validación automática y despliegues consistentes |
| Ejecución automática de smoke tests  | Permite detectar fallos críticos tras cada despliegue      |
| Soporte de rollback rápido           | Reduce impacto operativo ante errores en producción        |
| Estrategia estructurada de ramas     | Facilita el trabajo colaborativo y control de versiones    |
| Downtime máximo controlado           | Mejora disponibilidad y continuidad del servicio           |

---

## 3.3. Restricciones de diseño y arquitectura

Estas restricciones definen lineamientos relacionados con la estructura interna del sistema, modularidad y desacoplamiento de componentes.

| Restricción                    | Justificación                                  |
| ------------------------------ | ---------------------------------------------- |
| Uso de Clean Architecture      | Mantiene separación clara de responsabilidades |
| Uso de puertos y adaptadores   | Facilita independencia tecnológica             |
| Comunicación basada en eventos | Permite desacoplamiento entre módulos          |
| Reutilización de componentes   | Reduce duplicidad y deuda técnica              |

---

## 3.4. Restricciones de calidad y código limpio

Estas restricciones buscan mantener estándares consistentes de desarrollo y legibilidad del código.

| Restricción                               | Justificación                               |
| ----------------------------------------- | ------------------------------------------- |
| Validación automática de linting y tipado | Garantiza consistencia y calidad del código |
| Máximo de líneas por función              | Reduce complejidad y mejora mantenibilidad  |
| Máximo de líneas por archivo              | Favorece separación de responsabilidades    |
| Logging estructurado                      | Facilita monitoreo y diagnóstico            |
| Límite de dependencias externas           | Reduce complejidad y vulnerabilidades       |

---

## 3.5. Restricciones de testing y aseguramiento de calidad

Estas restricciones establecen mecanismos mínimos para garantizar estabilidad y confiabilidad del sistema.

| Restricción                                  | Justificación                                 |
| -------------------------------------------- | --------------------------------------------- |
| Cobertura mínima de pruebas                  | Mejora confiabilidad del sistema              |
| Pruebas de integración para módulos críticos | Validan comportamiento real del sistema       |
| Seeds versionados e idempotentes             | Facilitan pruebas y configuración de entornos |
| Gestión formal de incidentes                 | Permite trazabilidad y mejora continua        |

---

## 3.6. Restricciones de seguridad

Estas restricciones buscan proteger la información, reducir vulnerabilidades y garantizar buenas prácticas de seguridad.

| Restricción                           | Justificación                            |
| ------------------------------------- | ---------------------------------------- |
| Uso obligatorio de HTTPS              | Protege la comunicación cliente-servidor |
| Validación y sanitización de entradas | Previene ataques de inyección            |
| Implementación de rate limiting       | Reduce abuso y ataques automatizados     |
| Protección de errores internos        | Evita exposición de información sensible |
| Protección anti-bots                  | Reduce spam y automatización maliciosa   |

---

## 3.7. Restricciones de documentación técnica

Estas restricciones garantizan trazabilidad técnica y facilidad de mantenimiento del proyecto.

| Restricción                            | Justificación                                        |
| -------------------------------------- | ---------------------------------------------------- |
| README técnico documentado             | Facilita onboarding de desarrolladores               |
| Registro de decisiones arquitectónicas | Conserva contexto técnico del sistema                |
| Documentación automática de API        | Mantiene sincronización entre código y documentación |

---

## 3.8. Restricciones metodológicas

Estas restricciones definen lineamientos relacionados con la organización y gestión del desarrollo del proyecto.

| Restricción                                    | Justificación                           |
| ---------------------------------------------- | --------------------------------------- |
| Desarrollo iterativo                           | Facilita adaptación continua            |
| Gestión de backlog centralizada                | Mejora organización y trazabilidad      |
| Seguimiento de tareas mediante GitHub Projects | Permite control del avance del proyecto |

---

# 4. Restricciones de negocio

## 4.1. Definición e impacto en el diseño

Las restricciones de negocio representan el conjunto de condiciones organizacionales, operativas, legales, económicas y estratégicas que influyen directamente en el alcance, desarrollo y evolución del sistema.

Estas restricciones permiten establecer límites y prioridades para la toma de decisiones técnicas y funcionales, garantizando que la solución desarrollada responda adecuadamente a las necesidades reales del negocio y del contexto operativo del proyecto.

En el contexto de Inmuebles El Guarzo, las restricciones de negocio impactan directamente aspectos como:

- Priorización de funcionalidades
- Alcance del sistema
- Selección tecnológica
- Estrategia de despliegue
- Organización del equipo
- Gestión del tiempo
- Escalabilidad progresiva
- Sostenibilidad operativa

Además, estas restricciones condicionan múltiples decisiones arquitectónicas y metodológicas adoptadas durante el desarrollo, buscando equilibrar factores como complejidad técnica, tiempo de entrega, costos operativos y mantenibilidad del sistema.

---

## 4.2. Restricciones humanas

Estas restricciones están relacionadas con la capacidad operativa, tamaño del equipo y disponibilidad de recursos humanos para el desarrollo del proyecto.

| Restricción                                                                                                                                                                                                   | Justificación                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Plan de acción                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| El equipo de negocio solamente cuenta con 2 horas y media diarias para trabajar en el proyecto.                                                                                                               | Si el equipo del negocio solo dispone de 2 horas y media al día, cualquier reunión mal planificada, sesión innecesariamente larga o solicitud de retroalimentación sin agenda clara puede consumir toda la disponibilidad de una jornada sin generar avance real. Perder un solo día equivale a acumular retraso, porque no hay horas de reserva para recuperar. El proyecto depende de que cada minuto de contacto con el negocio produzca decisiones concretas.                                                   | Planificar todas las sesiones con el equipo de negocio con agenda definida, duración máxima acordada y entregable esperado antes de cada reunión. Preparar previamente los materiales para que las sesiones sean de decisión, no de exploración. Documentar cada decisión en el momento para no repetir reuniones por falta de registro. Priorizar las validaciones más críticas primero, y dejar las revisiones menores para comunicación escrita.                                                      |
| Los asesores del negocio cuentan con una disponibilidad limitada, con horarios laborales en semana de 10:00 AM a 8:00 PM. Y sabados de 9:00 AM a 1:00PM                                                       | Los asesores son quienes conocen el día a día del negocio inmobiliario: cómo se capta un inmueble, cómo se atiende al cliente, qué información necesitan para cerrar un negocio. Si no se respeta su horario laboral (lunes a viernes de 10:00 AM a 8:00 PM, sábados de 9:00 AM a 1:00 PM), simplemente no van a estar disponibles para validar funcionalidades ni para aportar su conocimiento operativo. Intentar agendar sesiones fuera de esos horarios solo genera frustración y retrasos.                     | Agendar todas las sesiones de trabajo con asesores exclusivamente dentro de su horario laboral. Establecer un calendario semanal fijo con franjas reservadas para validación del proyecto, acordadas desde el inicio. Si se necesitan validaciones urgentes los sábados, concentrarlas en la franja de 9:00 AM a 1:00 PM y avisarles con mínimo 48 horas de anticipación.                                                                                                                                |
| Los integrantes deben tener conocimiento completo del negocio. Y tener conocimiento de todas las desiciones tomadas. Si alguno se incapacita el otro debe poder seguir sin problema                           | Si el conocimiento del proyecto queda concentrado en una sola persona y esa persona se incapacita, enferma o tiene una emergencia personal, el proyecto se paraliza completamente porque nadie más sabe qué se decidió, por qué se decidió ni en qué punto va cada tarea. En un equipo pequeño como el de este proyecto, la dependencia de una sola persona es un riesgo directo de fracaso. La inmobiliaria no puede darse el lujo de perder semanas porque alguien no está disponible temporalmente.              | Mantener toda la documentación de decisiones, diseños y acuerdos actualizada y accesible para todos los integrantes del equipo. Realizar sesiones periódicas de alineación donde ambos miembros compartan el estado de lo que están trabajando. Establecer la regla de que ninguna decisión importante se toma sin quedar documentada por escrito en un lugar compartido, de modo que cualquier integrante pueda retomar el trabajo del otro sin pérdida de contexto.                                    |
| Los asesores del negocio son personas con perfil comercial, no técnico, y su nivel de alfabetización digital es variable.                                                                                     | Los asesores de la inmobiliaria son personas con experiencia en ventas y atención al cliente, no en manejo de sistemas complejos. Si el sistema que se construye requiere conocimientos especializados para operarlo, los asesores no lo van a usar correctamente o simplemente lo van a rechazar y volverán a trabajar como lo hacían antes. Un sistema que el equipo del negocio no adopta es un sistema que fracasa, sin importar qué tan bien esté construido.                                                  | Diseñar todas las interfaces del sistema pensando en personas sin formación en sistemas: lenguaje claro, instrucciones visibles, flujos simples y sin jerga. Validar cada pantalla con al menos un asesor real antes de darla por terminada. Incluir mensajes de ayuda y guías visuales dentro del sistema para que los asesores puedan operar sin necesidad de un manual extenso ni de llamar a soporte.                                                                                                |
| El stakeholder principal (dueño de la inmobiliaria) tiene disponibilidad limitada para sesiones de validación y retroalimentación del proyecto.                                                               | El dueño de la inmobiliaria es quien tiene la visión del negocio, aprueba la dirección del proyecto y toma las decisiones finales sobre cómo debe funcionar el sistema. Si su tiempo es limitado y no se gestiona bien, el proyecto corre el riesgo de avanzar en una dirección equivocada durante semanas sin que nadie lo corrija, para luego tener que rehacer trabajo cuando finalmente el dueño revise y diga que no era lo que esperaba. Eso cuesta tiempo y esfuerzo que no se pueden desperdiciar.          | Programar sesiones cortas de validación con el dueño de la inmobiliaria en intervalos regulares (por ejemplo, cada 2 semanas) con agenda definida y entregables concretos para revisar. Presentarle avances visuales que pueda evaluar rápidamente, no documentos extensos. Escalar las decisiones más importantes a estas sesiones y resolver las operativas con el equipo directamente, para hacer el mejor uso posible de su tiempo limitado.                                                         |
| La capacidad total del equipo del negocio estimada, no supera las 30-40 horas-persona por semana                                                                                                              | Con un máximo de 30 a 40 horas-persona por semana del lado del negocio, la capacidad de acompañamiento, validación y retroalimentación es limitada. Si se intenta avanzar más rápido de lo que el equipo del negocio puede revisar y aprobar, se acumulan funcionalidades sin validar que después resultan incorrectas. El ritmo de desarrollo tiene que adaptarse a esta capacidad real, no al revés, porque construir algo que no ha sido validado por el negocio es construir algo con alto riesgo de estar mal. | Planificar las entregas y validaciones del proyecto en función de la capacidad real del equipo del negocio, no de la capacidad ideal. Distribuir las horas semanales disponibles de forma estratégica: dedicar la mayor parte a validación de funcionalidades críticas y reservar un porcentaje menor para revisiones de detalle. Si alguna semana el negocio no puede cumplir sus horas, ajustar el plan sin forzar sesiones improductivas.                                                             |
| No existe un equipo de soporte técnico dedicado para atender incidentes o consultas de los usuarios del sistema después del lanzamiento. El soporte recaerá inicialmente en el mismo equipo que lo construyó. | Después del lanzamiento, los asesores y el administrador van a tener dudas, van a encontrar situaciones que no saben resolver y van a necesitar ayuda. Si no se planifica quién les va a dar ese soporte y cómo, los usuarios se frustran, dejan de usar el sistema y todo el esfuerzo del proyecto se pierde. Además, si aparece un error que impide trabajar y no hay nadie asignado para resolverlo, la operación del negocio se detiene.                                                                        | Definir desde antes del lanzamiento quién será el responsable de atender consultas y resolver problemas del sistema en los primeros meses de operación. Crear una guía de preguntas frecuentes y soluciones a problemas comunes para que los usuarios puedan resolver por sí mismos las situaciones más sencillas. Establecer un canal de comunicación claro (por ejemplo, un grupo o un correo dedicado) donde el equipo del negocio pueda reportar problemas y recibir respuesta en un plazo definido. |

---

## 4.3. Restricciones de tiempo

Estas restricciones contemplan limitaciones relacionadas con cronogramas de entrega, duración del proyecto y tiempos de implementación.

| Restricción                                                                                                                                                                                    | Justificación                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Plan de acción                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| El producto debe estar listo antes de una temporada alta(al inicio del año suele haber temporada alta de inmuebles en Colombia), ya que despues de esa fecha la demanda se reduce notablemente | El negocio inmobiliario en Colombia tiene ciclos claros: al inicio del año la demanda de inmuebles sube significativamente. Si el sistema no está listo antes de esa temporada alta, la inmobiliaria pierde la oportunidad de captar clientes con una herramienta profesional justo cuando más gente está buscando propiedad. Lanzar después de la temporada alta significa esperar varios meses para tener un volumen de visitantes comparable, y mientras tanto la inversión en el sistema no genera retorno.      | Definir desde el inicio del proyecto la fecha de la próxima temporada alta como una fecha límite inamovible para el lanzamiento. Planificar las entregas hacia atrás desde esa fecha, priorizando las funcionalidades que más impacto tienen en la captación de clientes durante la temporada. Si hay riesgo de no llegar, recortar alcance en funcionalidades secundarias antes de mover la fecha, porque perder la temporada alta tiene un costo de oportunidad mayor que lanzar con menos funcionalidades. |
| El proyecto debe estar completo en un tiempo limite desde su inicio en febrero del 2026 hasta su lanzamiento de 20 meses (No MVP) en el ultimo trimestre de 2027                               | Un plazo de 20 meses desde febrero de 2026 hasta el último trimestre de 2027 para el producto completo (no solo un MVP) es un compromiso que define la viabilidad financiera y estratégica del proyecto. Si el proyecto se extiende más allá de ese plazo, la inmobiliaria lleva más tiempo invirtiendo esfuerzo sin retorno completo, la motivación del equipo se desgasta y el mercado puede cambiar. Este plazo es la promesa del proyecto al negocio, y si no se cumple, se pierde la confianza del stakeholder. | Elaborar un cronograma general del proyecto con hitos intermedios verificables cada 2 a 3 meses. Hacer seguimiento constante del avance contra esos hitos. Si en algún punto el avance se desvía del plan, tomar decisiones correctivas inmediatas: reasignar prioridades, simplificar funcionalidades o negociar con el stakeholder ajustes de alcance, pero nunca dejar pasar el desfase sin actuar. Cada hito debe tener un criterio claro de "terminado" para evitar ambigüedades.                        |
| La plataforma debe permitir la carga administrativa de inventario al menos 45 días antes de la apertura al público general (MVP).                                                              | La inmobiliaria necesita tiempo para cargar su inventario de inmuebles, revisar la información, subir las fotografías y verificar que todo se vea bien antes de abrir al público. Si la plataforma se lanza sin ese periodo de preparación, el catálogo estará vacío o incompleto cuando lleguen los primeros visitantes, dando una imagen poco profesional que espanta a los clientes en lugar de atraerlos. La primera impresión del catálogo público es crucial para la credibilidad del negocio.                 | Incluir en el cronograma del proyecto un periodo mínimo de 45 días calendario entre la entrega del MVP funcional al equipo administrativo y la fecha de apertura al público. Durante esos 45 días, acompañar al equipo del negocio en la carga del inventario, resolver dudas operativas y corregir problemas que surjan del uso real. No abrir al público hasta que el catálogo tenga un volumen mínimo de inmuebles que refleje una oferta seria.                                                           |

---

## 4.4. Restricciones legales

Estas restricciones agrupan condiciones relacionadas con cumplimiento normativo, protección de datos y requisitos legales aplicables al sistema.

| Restricción                                                                                                                                                                                                | Justificación                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Plan de acción                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| El sistema debe cumplir con la Ley 1581 de 2012 (Protección de Datos Personales) y el Decreto 1377 de 2013 en todo tratamiento de datos de clientes, propietarios y asesores.                              | La Ley 1581 de 2012 y el Decreto 1377 de 2013 protegen los datos personales de todos los colombianos. La inmobiliaria maneja datos sensibles de clientes compradores, propietarios y asesores: nombres, teléfonos, correos, direcciones de propiedades. Si el sistema no cumple esta ley, la Superintendencia de Industria y Comercio puede imponer multas de hasta 2.000 salarios mínimos legales mensuales vigentes. Más allá de la multa, una violación de datos destruye la confianza que los clientes y propietarios depositan en la inmobiliaria.          | Definir desde el diseño del sistema qué datos personales se recogen, para qué se usan y cómo se protegen. Incluir en todos los formularios que recojan datos personales la política de tratamiento de datos y una casilla de aceptación que no venga marcada de antemano. Registrar automáticamente cuándo y cómo se obtuvo la autorización de cada persona. Establecer un procedimiento claro para que cualquier persona pueda pedir la consulta, corrección o eliminación de sus datos.                           |
| La información publicada en el catálogo debe cumplir con la Ley 1480 de 2011 (Estatuto del Consumidor), evitando publicidad engañosa o información que induzca a error.                                    | La Ley 1480 de 2011 (Estatuto del Consumidor) protege a los compradores de publicidad engañosa o información que induzca a error. Si el catálogo muestra un precio que no corresponde, una ubicación incorrecta, un área que no coincide con la realidad o fotografías de un inmueble diferente, la inmobiliaria se expone a sanciones y a reclamaciones de los consumidores. La credibilidad del catálogo depende de que la información publicada sea veraz, completa y actualizada.                                                                            | Establecer en las reglas del negocio que toda información publicada en el catálogo debe ser verificada por el asesor responsable antes de activar la oferta. Diseñar el sistema de manera que no se pueda activar una oferta sin que los campos críticos (precio, ubicación, área, tipo de inmueble) estén completos. Mantener actualizado el catálogo de forma que cuando un inmueble se venda, arriende o cambie de condiciones, la información se refleje rápidamente y no siga mostrándose la versión anterior. |
| El valor del canon de arriendo mensual no debe superar el 1% del valor comercial del inmueble, conforme al artículo 18 de la Ley 820 de 2003.                                                              | El artículo 18 de la Ley 820 de 2003 establece que el canon mensual de arriendo de vivienda urbana no puede superar el 1% del valor comercial del inmueble. Si la inmobiliaria publica ofertas de arriendo con cánones que excedan este tope, se expone a reclamaciones de los arrendatarios, demandas y sanciones. Además, publicar cánones ilegales afecta directamente la reputación del negocio como una inmobiliaria seria y confiable ante propietarios y arrendatarios.                                                                                   | Incluir en el proceso de creación de ofertas de arriendo una verificación que compare el canon mensual ingresado contra el 1% del valor comercial del inmueble. Si el canon supera ese límite, el sistema debe alertar al asesor para que revise la cifra antes de publicar. La alerta debe ser informativa (no bloqueante), ya que pueden existir excepciones legales que el asesor conozca, pero debe quedar registrado que se advirtió sobre la situación.                                                       |
| El catálogo público debe identificar claramente a Inmuebles El Guarzo como responsable de la publicación, incluyendo nombre comercial y canal de contacto verificable.                                     | Identificar claramente a la inmobiliaria como responsable de la publicación es una obligación de transparencia comercial y una exigencia legal. Los clientes necesitan saber con quién están tratando: quién publica, cómo contactarlos y quién responde ante cualquier inconveniente. Si el catálogo no muestra esta información de forma clara y accesible, genera desconfianza en los visitantes y expone a la inmobiliaria ante la autoridad de protección al consumidor por falta de identificación del anunciante.                                         | Incluir de forma permanente y visible en el catálogo público el nombre comercial de Inmuebles El Guarzo, junto con al menos un canal de contacto verificable (correo electrónico, teléfono o WhatsApp). Esta información debe estar presente en el pie de página de todas las secciones del catálogo y en la ficha de cada inmueble. El administrador debe poder actualizar estos datos desde el panel sin necesidad de ayuda externa.                                                                              |
| El sistema no debe almacenar ni procesar información financiera de clientes (números de cuenta, tarjetas de crédito) ya que la inmobiliaria no realiza transacciones monetarias a través de la plataforma. | La inmobiliaria no realiza cobros ni transacciones monetarias a través de la plataforma. Almacenar números de cuenta, tarjetas de crédito o información financiera de los clientes sería asumir una responsabilidad legal y de seguridad enorme sin ninguna necesidad de negocio. Si el sistema almacena datos financieros, la inmobiliaria queda obligada a cumplir regulaciones financieras adicionales, asumir el riesgo de una filtración de datos bancarios y enfrentar consecuencias legales severas por un dato que nunca necesitó tener.                 | No diseñar ni incluir en ningún formulario del sistema campos para capturar información financiera (números de cuenta, tarjetas de crédito, datos bancarios). Dejar explícitamente documentado en las reglas del negocio que la plataforma no procesa pagos ni almacena datos financieros de ningún tipo. Si en el futuro se considera agregar funcionalidad de pagos, tratarlo como un proyecto separado con su propio análisis legal y de seguridad.                                                              |
| El sistema debe permitir a cualquier titular de datos ejercer su derecho de consulta, actualización o supresión de datos en un plazo no mayor a 15 días hábiles.                                           | La Ley 1581 de 2012 otorga a toda persona el derecho de consultar, actualizar o solicitar la eliminación de sus datos personales, y obliga al responsable del tratamiento a responder en un plazo máximo de 15 días hábiles. Si la inmobiliaria no puede cumplir este plazo porque el sistema no facilita la localización y gestión de los datos de una persona, se expone a sanciones de la Superintendencia de Industria y Comercio. No es solo un requisito legal: es un compromiso de respeto con las personas que confían su información a la inmobiliaria. | Diseñar el sistema de manera que el administrador pueda localizar todos los datos asociados a una persona (por nombre, correo o teléfono) de forma rápida. Establecer un procedimiento interno documentado para atender solicitudes de consulta, actualización o supresión de datos, con un responsable asignado y un plazo de respuesta que no supere los 10 días hábiles (dejando margen frente al límite legal de 15). Registrar cada solicitud recibida y la respuesta dada como evidencia de cumplimiento.     |

---

## 4.5. Restricciones presupuestales

Estas restricciones están asociadas a limitaciones económicas y costos de infraestructura, herramientas y servicios externos.

| Restricción                                                                                | Justificación                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Plan de acción                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| :----------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| El presupuesto mensual para mantener el sistema en producción es de $17 USD (~$62.527 COP) | El negocio es una inmobiliaria en etapa inicial que necesita validar su modelo con la menor inversión posible. Un presupuesto de $17 USD mensuales para mantener el sistema funcionando obliga a tomar decisiones inteligentes sobre cómo se construye y dónde se aloja. Si se diseña un sistema que necesita más recursos de los que este presupuesto puede pagar, el negocio no podrá sostenerlo después del lanzamiento y el proyecto habrá sido un esfuerzo inútil. La sostenibilidad económica del sistema es tan importante como su funcionalidad. | Evaluar desde la fase de diseño que toda decisión de infraestructura y servicios se ajuste a este presupuesto mensual. Documentar los costos estimados de cada componente del sistema en producción y sumarlos para verificar que no se exceda el límite. Si alguna funcionalidad implica un costo que supere el presupuesto, buscar alternativas más económicas o negociar con el stakeholder si está dispuesto a ajustar el presupuesto para esa funcionalidad específica.       |
| El presupuesto de desarrollo del proyecto es $0 COP en licencias de software.              | Al no haber presupuesto para licencias de software, todo lo que se utilice para construir el sistema debe ser de uso libre o gratuito. Si en algún punto del desarrollo se adopta una herramienta que después exige un pago por licencia, el proyecto se detiene o se ve obligado a rehacer esa parte con otra herramienta, perdiendo tiempo y esfuerzo. Esta restricción no es negociable: el proyecto no tiene cómo pagar licencias, y todas las decisiones deben tomarse con esta realidad desde el primer día.                                       | Verificar antes de adoptar cualquier herramienta, librería o servicio que su licencia de uso permita el uso comercial sin costo. Documentar cada herramienta seleccionada con su tipo de licencia para tener trazabilidad. Si en algún momento una herramienta gratuita cambia sus condiciones y empieza a cobrar, tener identificadas alternativas libres para hacer el reemplazo sin afectar el funcionamiento del sistema.                                                      |
| El costo del servicio de envío de correos electrónicos debe ser menor a $5 USD             | El sistema necesita enviar correos electrónicos para funciones esenciales del negocio: verificación de cuentas de asesores, recuperación de contraseñas, confirmación de solicitudes de contacto y notificación a propietarios sobre el estado de sus solicitudes de publicación. Si el costo del servicio de correo supera los $5 USD mensuales, se come una porción importante del presupuesto total de $17 USD y deja sin espacio para los demás costos de operación. Cada dólar cuenta cuando el presupuesto es tan ajustado.                        | Investigar y seleccionar un servicio de envío de correos que ofrezca un plan gratuito o de bajo costo que cubra el volumen estimado de correos mensuales del negocio (verificaciones de cuenta, recuperaciones de contraseña, confirmaciones de solicitudes, notificaciones a propietarios). Estimar el volumen mensual de correos esperado y verificar que no se exceda la cuota del plan seleccionado. Monitorear mensualmente el consumo para anticipar si se acerca al límite. |

---

## 4.6. Restricciones de escalabilidad

Estas restricciones contemplan limitaciones y estrategias relacionadas con el crecimiento progresivo del sistema y su capacidad operativa futura.

| Restricción                                                                                                                   | Justificación                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Plan de acción                                                                                                                                                                                                                                                                                                                                                                                                                         |
| :---------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| El almacenamiento de imágenes debe estar desacoplado del servidor de la aplicación para poder escalar de forma independiente. | Las fotografías son el elemento más pesado del sistema y el que más espacio de almacenamiento consume. Si las imágenes se guardan en el mismo lugar donde funciona la aplicación, a medida que crezca el inventario de inmuebles el espacio se agotará y el sistema se volverá lento o dejará de funcionar. Separar las imágenes permite que el catálogo de fotos crezca sin afectar el funcionamiento del resto del sistema y sin necesidad de rediseñar todo cuando el volumen de fotos aumente.                                              | Definir desde el diseño del sistema que las fotografías de los inmuebles se almacenarán de forma separada al resto de la información del sistema. Estimar el volumen de almacenamiento necesario según la cantidad de inmuebles esperados y el límite de 15 fotos por inmueble (hasta 2 MB cada una comprimida). Verificar que esta estrategia de almacenamiento separado se pueda mantener dentro del presupuesto mensual de $17 USD. |
| El sistema se desarrollará exclusivamente para un entorno web                                                                 | Desarrollar para múltiples plataformas (aplicación móvil nativa, aplicación de escritorio, etc.) multiplicaría el esfuerzo de desarrollo, las pruebas y el mantenimiento, algo que no es viable con los recursos limitados del proyecto. Concentrar todo el esfuerzo en un entorno web permite llegar a clientes desde cualquier dispositivo con un navegador (computador, tablet o celular) sin tener que construir y mantener versiones separadas. Es la forma más eficiente de lograr el mayor alcance posible con los recursos disponibles. | Diseñar el sistema exclusivamente para funcionar en navegadores web, asegurando que se vea y funcione correctamente tanto en computadores de escritorio como en dispositivos móviles. No planificar ni comprometer recursos para el desarrollo de aplicaciones nativas para celulares. Si en el futuro el negocio crece y hay presupuesto para una aplicación móvil, se evaluará como un proyecto independiente.                       |

---

## 4.7. Restricciones organizacionales

Estas restricciones están relacionadas con procesos internos, coordinación del equipo y lineamientos organizativos definidos para el proyecto.

| Restricción                                                                                                                                                          | Justificación                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Plan de acción                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| :------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Todo cambio significativo en diseño o arquitectura debe ser consultado y validado con el stakeholder (dueño de la inmobiliaria) antes de implementarse.              | El dueño de la inmobiliaria es quien mejor conoce su negocio, sus clientes y su visión de futuro. Si se toman decisiones importantes sobre cómo funciona el sistema sin consultarlo, existe un riesgo alto de construir algo que no se alinea con lo que el negocio necesita. Rehacer trabajo por falta de validación es más costoso que dedicar tiempo a una reunión de aprobación. Cada decisión importante que se toma sin su visto bueno es una apuesta que puede salir muy cara.                                                           | Establecer que todo cambio significativo en el diseño, la estructura del sistema o las reglas del negocio se presente al dueño de la inmobiliaria para su aprobación antes de empezar a construirlo. Preparar presentaciones visuales claras y concisas para que pueda evaluar rápidamente. Documentar su aprobación o sus observaciones para tener respaldo de cada decisión. No avanzar en la construcción de funcionalidades nuevas sin esta validación.                                                                           |
| El sistema debe poder ser mantenido y evolucionado por un desarrollador que no haya participado en el desarrollo original, sin asistencia directa del equipo actual. | Si el sistema solo puede ser entendido, modificado o corregido por las personas que lo construyeron originalmente, la inmobiliaria queda completamente dependiente de ellos para cualquier cambio futuro. Si esas personas ya no están disponibles (cambio de empleo, falta de tiempo, cualquier razón), el negocio se queda con un sistema que nadie puede tocar sin riesgo de dañarlo. Un sistema que no puede ser mantenido por otra persona es un sistema con fecha de vencimiento, y eso es inaceptable para un negocio que planea crecer. | Documentar las decisiones de diseño y la estructura del sistema de forma que una persona nueva pueda entenderlas sin necesidad de hablar con el equipo original. Escribir el código de forma clara y ordenada, siguiendo convenciones que cualquier profesional del área pueda reconocer. Incluir instrucciones de cómo poner en marcha el sistema, cómo hacer cambios comunes y cómo resolver problemas frecuentes. Validar esta documentación haciendo que una persona externa intente entender el sistema solo con lo documentado. |

---

# 5. Atributos de calidad

## 5.1 Definición e impacto en el diseño

Los atributos de calidad representan las características no funcionales que determinan qué tan bien debe comportarse un sistema frente a distintos escenarios operativos, técnicos y de negocio.

A diferencia de los requerimientos funcionales, los atributos de calidad no describen qué hace el sistema, sino cómo debe hacerlo, estableciendo criterios relacionados con desempeño, seguridad, confiabilidad, mantenibilidad y capacidad de evolución.

En el contexto de Inmuebles El Guarzo, los atributos de calidad fueron fundamentales para orientar decisiones arquitectónicas, tecnológicas y operativas del proyecto, permitiendo priorizar aspectos críticos como la seguridad de la información, la estabilidad del sistema, la escalabilidad de la plataforma y la facilidad de mantenimiento.

La priorización de estos atributos se realizó considerando las necesidades del negocio, los riesgos identificados, los objetivos del sistema y el análisis de usuarios realizado mediante herramientas como mapas de empatía y evaluación de escenarios arquitectónicos.

---

## 5.2 Atributos de calidad priorizados

Los siguientes atributos de calidad fueron seleccionados y organizados según su nivel de prioridad dentro del proyecto:

| Prioridad | Atributo de calidad             | Descripción                                                                                                   |
| --------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| 1         | Confiabilidad                   | Garantizar que el sistema funcione correctamente y mantenga estabilidad operativa ante distintos escenarios.  |
| 2         | Usabilidad                      | Facilitar la interacción de los usuarios con la plataforma de manera clara, intuitiva y eficiente.            |
| 3         | Seguridad                       | Proteger la información, autenticación y comunicación del sistema frente a amenazas y accesos no autorizados. |
| 4         | Disponibilidad                  | Mantener el sistema accesible y operativo la mayor cantidad de tiempo posible.                                |
| 5         | Rendimiento                     | Garantizar tiempos de respuesta adecuados y eficiencia en el procesamiento de solicitudes.                    |
| 6         | Conformidad                     | Cumplir estándares técnicos, organizacionales y buenas prácticas de desarrollo.                               |
| 7         | Trazabilidad                    | Permitir seguimiento de eventos, operaciones y cambios realizados dentro del sistema.                         |
| 8         | Capacidad para ser administrado | Facilitar la supervisión, monitoreo y gestión operativa de la plataforma.                                     |
| 9         | Escalabilidad                   | Permitir el crecimiento progresivo del sistema sin afectar su estabilidad.                                    |
| 10        | Flexibilidad                    | Facilitar la adaptación del sistema frente a cambios futuros de negocio o tecnología.                         |
| 11        | Capacidad para ser probado      | Permitir la validación eficiente del comportamiento del sistema mediante pruebas.                             |
| 12        | Capacidad para ser desplegado   | Facilitar procesos de integración y despliegue continuo.                                                      |
| 13        | Capacidad para ser mantenido    | Reducir la complejidad de mantenimiento y evolución del software.                                             |
| 14        | Costo                           | Optimizar el uso de recursos tecnológicos y operativos del proyecto.                                          |

---

## 5.3 Relación de los atributos de calidad con la arquitectura

La priorización de estos atributos influyó directamente en múltiples decisiones arquitectónicas y tecnológicas del proyecto, incluyendo:

- Implementación de Clean Architecture para mejorar mantenibilidad, escalabilidad y separación de responsabilidades.
- Uso de Docker y contenedores para facilitar despliegues consistentes y automatizados.
- Integración de herramientas DevOps para fortalecer trazabilidad y automatización.
- Implementación de mecanismos de autenticación y protección perimetral para reforzar la seguridad.
- Organización modular del sistema para favorecer flexibilidad y evolución progresiva.
- Uso de servicios cloud-native para mejorar disponibilidad y rendimiento operativo.

---

## 5.4 Priorización y análisis de atributos

La selección y priorización de atributos de calidad se realizó mediante análisis de necesidades del negocio, escenarios de uso y evaluación de expectativas de los usuarios.

Para ello se utilizaron herramientas de apoyo como matrices de priorización y mapas de empatía, los cuales permitieron identificar los atributos más relevantes para el contexto operativo de la plataforma.

<table align="center">
  <tr>
    <td align="center">
      <img
        src="./assets/quality/prioridad-atributos.png"
        width="450"
        alt="Priorización de atributos de calidad"
      />
    </td>
    <td align="center">
      <img
        src="./assets/quality/mapa-empatia.png"
        width="450"
        alt="Mapa de empatía"
      />
    </td>
  </tr>
</table>

---

<p align="center">
  Calidad de software · Escalabilidad · Seguridad · Arquitectura empresarial
</p>

---

# 6. Funcionalidades críticas del sistema

## 6.1 Definición e impacto en el diseño

Las funcionalidades críticas representan el conjunto de procesos, capacidades y operaciones esenciales para el correcto funcionamiento del sistema y el cumplimiento de los objetivos del negocio.

Estas funcionalidades corresponden a aquellos componentes cuyo correcto desempeño resulta fundamental para garantizar la continuidad operativa de la plataforma, la experiencia de los usuarios y la integridad de la información.

En el contexto de Inmuebles El Guarzo, las funcionalidades críticas permitieron identificar los procesos más relevantes del dominio inmobiliario, orientando decisiones relacionadas con arquitectura, seguridad, organización modular, persistencia de datos y diseño de APIs.

Además, estas funcionalidades influyen directamente en la priorización de atributos de calidad como confiabilidad, disponibilidad, seguridad y rendimiento, debido a que representan las operaciones centrales sobre las cuales se soporta la plataforma.

---

## 6.2 Funcionalidades críticas identificadas

| ID    | Funcionalidad crítica               | Historia de usuario                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Justificación                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Observaciones                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ----- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| HU-12 | Ciclo de vida de las ofertas        | Como asesor o administrador, necesito que las ofertas sigan el ciclo de vida definido (borrador → activa → pausada → activa → finalizada), que el sistema rechace transiciones no permitidas con un mensaje claro, y que la finalización requiera aprobación del administrador, para mantener la coherencia del catálogo según las reglas del negocio.                                                                                                                                                                                                             | El ciclo de vida de las ofertas es la columna vertebral operativa de la inmobiliaria. Si las transiciones no se validan correctamente, podrían reaparecer en el catálogo inmuebles ya vendidos o arrendados, generando confusión en los clientes, reclamos de los compradores y posibles problemas legales por publicidad engañosa conforme a la Ley 1480 de 2011. La aprobación obligatoria del administrador para la finalización es una regla de gobernanza del negocio que garantiza que ningún asesor cierre un negocio sin supervisión. Implementar esto requiere una máquina de estados como componente aislado y testeable, lo que representa un reto técnico que debe validarse con pruebas exhaustivas de todas las combinaciones de transiciones posibles.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Requiere implementar una máquina de estados con todas las transiciones permitidas y prohibidas definidas explícitamente. Probar cada combinación posible de transición (permitida y no permitida), verificar que la finalización genera solicitud de aprobación al administrador en vez de ejecutarse directamente, y verificar que cada intento de transición inválida produce un mensaje claro indicando la razón y el flujo correcto.                                                                                                                                                                                                                                               |
| HU-14 | Finalización de ofertas             | Como administrador, necesito que al marcar un inmueble como vendido o arrendado, el sistema finalice automáticamente todas sus ofertas activas, actualice la disponibilidad del inmueble y notifique al asesor asignado o a mi mismo, para reflejar la realidad de la oferta sin intervención manual adicional.                                                                                                                                                                                                                                                    | Esta es una operación que modifica múltiples entidades en una sola acción: cambia el estado de todas las ofertas activas del inmueble, actualiza la disponibilidad del inmueble en el catálogo público y genera una notificación al asesor. Si alguna de estas operaciones falla parcialmente (por ejemplo, las ofertas se finalizan pero el inmueble sigue apareciendo como disponible), el catálogo queda inconsistente y un cliente podría interesarse en un inmueble que ya fue vendido, generando una experiencia negativa y posibles reclamos. Técnicamente exige que todas las operaciones se ejecuten dentro de una transacción atómica donde o se completan todas o no se ejecuta ninguna.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Probar el flujo completo verificando que al marcar como vendido se finalizan todas las ofertas activas, que el inmueble deja de aparecer en el catálogo público, que el asesor recibe la notificación, y que si alguna operación falla la transacción se revierte completamente sin dejar estados parciales. Probar con un inmueble que tenga simultáneamente una oferta de venta activa y una de arriendo activa.                                                                                                                                                                                                                                                                     |
| HU-04 | Cuentas de asesores                 | Como administrador, necesito crear cuentas de asesor ingresando nombre y correo electrónico, donde el sistema envíe un correo de verificación con enlace de activación (vigencia 24 horas), para que el asesor establezca su propia contraseña y su cuenta se active solo tras verificar su identidad.                                                                                                                                                                                                                                                             | Este es el único mecanismo para incorporar asesores al sistema. Si el flujo falla, la inmobiliaria no puede crecer su equipo comercial. El flujo involucra integración con un servicio externo de correo para el envío del enlace de verificación, generación de tokens únicos con expiración temporal, y un proceso en dos fases (creación por el admin, activación por el asesor) que debe ser robusto ante escenarios como enlaces vencidos, correos no entregados o intentos de reutilización del enlace. Además, al manejar la definición de contraseñas, debe integrarse correctamente con las políticas de seguridad del sistema.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Probar el flujo completo de creación: el administrador crea la cuenta, el correo de verificación llega a la dirección registrada, el enlace funciona dentro de las 24 horas, el asesor establece una contraseña que cumpla las políticas de seguridad, y la cuenta pasa a estado activa. Probar también los escenarios de fallo: enlace usado después de 24 horas (debe rechazarse), enlace usado por segunda vez (debe rechazarse), y correo de verificación no entregado (debe poder reenviarse).                                                                                                                                                                                    |
| RF-73 | Datos personales                    | Antes de enviar cualquier formulario que incluya datos personales (solicitud de contacto, formulario de publicación), el sistema debe presentar la política de tratamiento de datos personales conforme a la Ley 1581 de 2012 y requerir aceptación explícita mediante casilla de verificación NO preseleccionada.                                                                                                                                                                                                                                                 | La Ley 1581 de 2012 y el Decreto 1377 de 2013 establecen que toda recolección de datos personales en Colombia requiere autorización previa, expresa e informada del titular. El sistema recoge datos personales en al menos dos puntos públicos: el formulario de solicitud de contacto del comprador y el formulario de solicitud de publicación del propietario. Si en alguno de estos formularios la casilla viene preseleccionada, el consentimiento se invalida legalmente. Si la política no se presenta, la recolección es ilegal. La Superintendencia de Industria y Comercio puede imponer multas de hasta 2.000 salarios mínimos legales mensuales vigentes. No es técnicamente complejo, pero su ausencia o implementación incorrecta tiene la consecuencia legal más directa y costosa de todo el sistema.                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Verificar que en el 100% de los formularios públicos que recogen datos personales aparece el enlace a la política de tratamiento de datos, que la casilla de aceptación no viene preseleccionada en ningún caso, que el formulario no permite el envío si la casilla no está marcada, y que la política de tratamiento de datos está accesible desde cualquier sección del sistema mediante un enlace visible permanente.                                                                                                                                                                                                                                                              |
| RF-75 | Registro propietarios               | Cuando un propietario registra su nombre, identificación, correo electronico, telefono y documentación de respaldo del inmueble validos(Verificados por el administrador o asesor) el sistema debe registrar la fecha y el medio por el cual se obtuvo la autorización para el tratamiento de datos, como respaldo ante requerimientos de la Superintendencia de Industria y Comercio.                                                                                                                                                                             | La Ley 1581 de 2012 no solo exige obtener la autorización del titular sino que obliga al responsable del tratamiento a poder demostrar que la obtuvo. Ante un requerimiento de la SIC, la inmobiliaria debe presentar evidencia de cuándo y cómo obtuvo la autorización de cada propietario cuyos datos tiene almacenados. Sin este registro, la inmobiliaria no tiene forma de probar cumplimiento y queda expuesta a sanciones. El registro debe ser automático e inmutable: el sistema debe capturar el timestamp y el canal de obtención sin depender de que el administrador lo haga manualmente, ya que un olvido humano dejaría un vacío probatorio.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Verificar que cada vez que se registra un propietario (ya sea por formulario público o por registro interno del administrador), el sistema almacena automáticamente la fecha, hora y medio de obtención de la autorización. Verificar que este registro no puede ser modificado ni eliminado por ningún usuario. Verificar que el administrador puede consultar esta información para cualquier propietario cuando la necesite.                                                                                                                                                                                                                                                        |
| RF-36 | Inmueble publicado para arriendo    | Cuando un inmueble se publique con oferta de arriendo, el sistema debe validar que el canon mensual ingresado no supere el 1% del valor comercial del inmueble conforme al artículo 18 de la Ley 820 de 2003, alertando al asesor si excede ese límite.                                                                                                                                                                                                                                                                                                            | La Ley 820 de 2003 establece un tope legal para el canon de arriendo de vivienda urbana en Colombia. Publicar ofertas con cánones que excedan este límite expone a la inmobiliaria a reclamaciones de los arrendatarios y sanciones. A diferencia de una validación técnica (como rechazar un precio negativo), esta validación requiere un cálculo que relaciona dos campos de entidades distintas (canon de la oferta versus valor comercial del inmueble), y debe alertar sin bloquear el guardado, ya que existen excepciones legales que el asesor puede conocer pero el sistema no.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Verificar que al crear o modificar una oferta de arriendo, el sistema calcula correctamente si el canon supera el 1% del valor comercial del inmueble y muestra la alerta correspondiente. Verificar que la alerta no bloquea el guardado sino que advierte. Verificar que si el valor comercial del inmueble se modifica posteriormente, el sistema recalcula y alerta si la oferta de arriendo existente ahora excede el límite. Probar con valores límite exactos (canon igual al 1%, canon de $1 por encima del 1%).                                                                                                                                                               |
| HU-10 | Fotografías del inmueble            | Como administrador o asesor inmobiliario, necesito cargar múltiples fotografías del inmueble en una sola operación (máximo 15 imágenes, formatos JPG/JPEG/PNG/WebP, máximo 10 MB cada una), que el sistema las comprima automáticamente a máximo 2 MB, y poder ordenarlas y definir la imagen principal, para que el inmueble se presente visualmente de forma atractiva en el catálogo.                                                                                                                                                                           | Las fotografías son el principal factor de atracción del catálogo inmobiliario. Sin embargo, el servidor de producción tiene recursos limitados , y comprimir imágenes de hasta 10 MB a 2 MB con generación simultánea de miniaturas es una operación intensiva en memoria y CPU. Si la compresión de una imagen de 10 MB consume 200 MB de RAM, dos cargas simultáneas podrían agotar los 512 MB disponibles y tumbar el servidor. Este riesgo técnico requiere una prueba de concepto para verificar que el procesamiento de imágenes es viable con los recursos de infraestructura disponibles sin afectar la estabilidad del sistema.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Se debe decidir en el diseño con que herramientas haremos la compresion de imagenes en poco tiempo, estrategias para que la carga de las 15 imagenes simultaneas no agote la memoria del servidor y que los formatos aceptados se validan realmente en el diseño                                                                                                                                                                                                                                                                                                                                                                                                                       |
| RF-14 | Seguridad en la interfaz y servidor | Toda verificación de permisos debe ejecutarse tanto en la interfaz (ocultando opciones no autorizadas) como en el servidor (rechazando peticiones no autorizadas), impidiendo evasión por manipulación del navegador.                                                                                                                                                                                                                                                                                                                                              | Si la autorización se verifica únicamente en el frontend (ocultando botones o menús), un usuario con conocimientos técnicos básicos puede manipular el navegador o enviar peticiones HTTP directas a los endpoints del servidor para acceder a funcionalidades restringidas: un asesor podría acceder a inmuebles de otros asesores, consultar datos de auditoría exclusivos del administrador, o modificar configuraciones del sistema. Esto comprometería datos personales protegidos por la Ley 1581 de 2012, la integridad operativa del negocio y la confianza de los propietarios que confían sus inmuebles a la inmobiliaria. La verificación en servidor es la diferencia entre un sistema que parece seguro y uno que realmente lo es.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Requiere pruebas de seguridad específicas: verificar que un asesor autenticado no puede acceder a endpoints del administrador mediante peticiones HTTP directas, verificar que un asesor no puede consultar ni modificar inmuebles asignados a otros asesores manipulando IDs en la URL, verificar que un usuario no autenticado no puede acceder a ningún endpoint privado, y verificar que las respuestas a peticiones no autorizadas retornan error 403 sin exponer información sobre la existencia del recurso.                                                                                                                                                                    |
| HU-63 | Envío de correos                    | Como administrador o asesor, necesito que cuando el sistema no logre entregar un correo electrónico (notificación a propietario, verificación de cuenta, confirmación de solicitud), el fallo se detecte y registre automáticamente con fecha, hora, destinatario y tipo de error, se reintente el envío hasta 3 veces de forma automática, y si después de agotar los reintentos no se entrega, aparezca una alerta visible en mi panel indicando la notificación pendiente, para garantizar que ninguna comunicación importante se pierda sin que nadie lo note. | El sistema depende de un servicio externo de correo electrónico para flujos críticos del negocio: la verificación de cuentas de asesores (HU-04), las notificaciones a propietarios sobre el estado de sus solicitudes de publicación (CON-C05-E09), y las confirmaciones de solicitudes de contacto de clientes. Si el servicio de correo falla y el sistema no detecta el problema, las consecuencias son silenciosas pero graves: un asesor nuevo no puede activar su cuenta y la inmobiliaria pierde capacidad operativa, un propietario nunca recibe respuesta sobre su solicitud y la inmobiliaria pierde una oportunidad de captación, o un cliente queda sin confirmación y pierde confianza en la inmobiliaria. A diferencia de un fallo interno que se manifiesta inmediatamente con un error visible, un fallo de correo puede pasar completamente desapercibido durante días si no existe un mecanismo de detección y alerta. Técnicamente requiere implementar una cola de reintentos con registro de fallos, lógica de reintentos progresivos, y un sistema de alertas que notifique al usuario encargado cuando la entrega no se completa, lo cual es un componente transversal que afecta múltiples módulos del sistema y no es trivial de implementar correctamente. | Verificar que ante un fallo del servicio de correo el sistema registra automáticamente el error con todos los datos (fecha, hora, destinatario, tipo de error). Verificar que se ejecutan exactamente 3 reintentos automáticos antes de generar la alerta. Verificar que la alerta aparece en el panel del usuario encargado de la solicitud (no en un panel genérico). Verificar que cuando el servicio de correo se restablece, los correos pendientes se envían correctamente. Probar con los tres flujos críticos afectados: verificación de cuenta de asesor, notificación a propietario por aceptación/rechazo de solicitud, y confirmación de solicitud de contacto de cliente. |

---

## 6.3 Relación de las funcionalidades críticas con la arquitectura

Las funcionalidades críticas identificadas influyeron directamente en la definición de múltiples decisiones arquitectónicas del sistema, incluyendo:

- Modularización de componentes mediante bounded contexts.
- Separación de responsabilidades utilizando Clean Architecture.
- Priorización de mecanismos de seguridad y autenticación.
- Diseño de APIs desacopladas y escalables.
- Estrategias de persistencia y validación de datos.
- Implementación de procesos automatizados de despliegue y monitoreo.
- Definición de integraciones con servicios externos.

Estas funcionalidades también permitieron establecer prioridades técnicas dentro del proyecto, enfocando esfuerzos de desarrollo sobre los procesos con mayor impacto funcional y operativo.

---

<p align="center">
  Funcionalidades críticas · Arquitectura empresarial · Procesos de negocio · Diseño del sistema
</p>

---

# 7. Tácticas y estrategias arquitectónicas

## 7.1 Definición e impacto en el diseño

Las tácticas y estrategias arquitectónicas representan el conjunto de decisiones, enfoques y mecanismos utilizados para cumplir los atributos de calidad, restricciones técnicas y necesidades funcionales del sistema.

Las estrategias corresponden a enfoques generales de diseño y organización del sistema, mientras que las tácticas representan mecanismos técnicos más específicos implementados para alcanzar objetivos concretos relacionados con seguridad, rendimiento, escalabilidad, mantenibilidad y confiabilidad.

En el contexto de Inmuebles El Guarzo, las tácticas y estrategias arquitectónicas permitieron orientar decisiones relacionadas con modularización, seguridad, automatización, despliegue, monitoreo y desacoplamiento del sistema.

Además, estas decisiones fueron fundamentales para responder a los escenarios de calidad identificados durante el análisis arquitectónico y para garantizar que las funcionalidades críticas del sistema pudieran evolucionar de manera sostenible y escalable.

---

## 7.2 Estrategias arquitectónicas identificadas

| ID        | Estrategia                                                  | Prioridad | Descripción                                                                                                                                                                                                                                                             | Justificación                                                                                                                                                                                                                                                                                            |
| :-------- | :---------------------------------------------------------- | :-------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **EA-01** | **Monolito Modular (Modular Monolith)**                     | **Alta**  | Organización del código fuente en módulos lógicos estrictamente independientes y fuertemente cohesionados por dominio de negocio (ej. propiedades, usuarios, autenticación), compartiendo una única base de datos pero con límites claros de acceso.                    | • Permite mitigar la restricción del equipo de desarrollo unipersonal al evitar la complejidad operativa de los microservicios.<br/>• Facilita una futura migración hacia microservicios si el volumen de negocio lo requiere, ya que las fronteras del dominio quedan bien delimitadas desde el inicio. |
| **EA-02** | **Arquitectura Hexagonal (Puertos y Adaptadores)**          | **Alta**  | Desacoplamiento del núcleo de lógica de negocio (dominio) de los agentes externos, frameworks y librerías de infraestructura (como NestJS, TypeORM o clientes de bases de datos), mediante el uso de interfaces (puertos) e implementaciones específicas (adaptadores). | • Garantiza la mantenibilidad y la evolución del software a largo plazo.<br/>• Permite que los cambios en tecnologías externas (como migrar de ORM o cambiar el proveedor de almacenamiento de imágenes) no afecten ni corrompan la lógica central de la inmobiliaria.                                   |
| **EA-03** | **Estrategia de Despliegue en la Nube PaaS / Contenedores** | **Media** | Adopción de un esquema de despliegue automatizado basado en contenedores Docker o plataformas como servicio (PaaS), gestionando la infraestructura de manera simplificada.                                                                                              | • Reduce los tiempos y costos de administración de servidores para un equipo reducido.<br/>• Asegura la reproducibilidad total del entorno de ejecución entre desarrollo, pruebas y producción.                                                                                                          |
| **EA-04** | **Estrategia de Persistencia Relacional Robusta**           | **Media** | Centralización del almacenamiento de datos del portal (propiedades, clientes, transacciones) en un motor relacional avanzado (PostgreSQL), modelando relaciones explícitas e integridad referencial estricta.                                                           | • Asegura la consistencia total de la información crítica del negocio (precios, estados de publicación, datos de contacto).<br/>• Permite realizar consultas geográficas o de filtrado complejo de manera nativa y eficiente.                                                                            |
| **EA-05** | **Estrategia de Seguridad por Capas (Defense in Depth)**    | **Baja**  | Implementación de barreras de seguridad perimetrales, de transporte y a nivel de aplicación, sin depender de un único mecanismo de defensa.                                                                                                                             | • Protege los activos digitales de la inmobiliaria y la privacidad de los usuarios contra ataques comunes de la web desde las fases iniciales del desarrollo.                                                                                                                                            |

---

## 7.3 Tácticas arquitectónicas identificadas

| ID        | Táctica                                                 | Atributo de calidad asociado | Prioridad | Descripción técnica de la táctica                                                                                                                                                                     | Razón de implementación                                                                                                                                                                                         |
| :-------- | :------------------------------------------------------ | :--------------------------- | :-------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **TA-01** | **Inyección de Dependencias (DI)**                      | Mantenibilidad               | **Alta**  | Uso del contenedor de inversión de control de NestJS para proveer las implementaciones de los adaptadores de infraestructura a los puertos del dominio en tiempo de ejecución.                        | • Elimina el acoplamiento duro entre clases.<br/>• Facilita la creación de pruebas unitarias al permitir sustituir componentes reales por mocks de manera directa.                                              |
| **TA-02** | **Autenticación mediante JWT y Roles (RBAC)**           | Seguridad                    | **Alta**  | Emisión de tokens firmados (JSON Web Tokens) tras el login exitoso, junto con interceptores y Guards que restringen el acceso a endpoints según el rol asignado (ej. Cliente, Asesor, Administrador). | • Protege las funcionalidades críticas de administración y edición de inmuebles.<br/>• Permite una arquitectura stateless (sin estado) eficiente y segura para el backend.                                      |
| **TA-03** | **Validación y Saneamiento de Datos de Entrada (DTOs)** | Seguridad / Robustez         | **Media** | Implementación de Data Transfer Objects estructurados combinados con pipes de validación (como `class-validator` en NestJS) para rechazar peticiones malformadas antes de que toquen el dominio.      | • Evita ataques de inyección de código o datos corruptos.<br/>• Actúa como primera línea de defensa del sistema asegurando que solo los tipos de datos correctos sean procesados.                               |
| **TA-04** | **Manejo Centralizado de Excepciones**                  | Confiabilidad                | **Media** | Uso de filtros globales de excepciones (Exception Filters) para capturar cualquier error inesperado en el ciclo de vida de la petición, formateando una respuesta estandarizada hacia el cliente.     | • Evita fugas de información sensible en los mensajes de error del sistema (como trazas de la base de datos).<br/>• Mejora la experiencia del cliente frontend al retornar siempre códigos HTTP correctos.      |
| **TA-05** | **Paginación y Caché en Consultas de Catálogo**         | Rendimiento                  | **Baja**  | Aplicación obligatoria de límites (limit/offset) en los endpoints de búsqueda de propiedades y almacenamiento temporal en memoria de los listados más populares.                                      | • Previene la saturación del ancho de banda y la degradación de memoria del servidor cuando el catálogo crezca considerablemente.<br/>• Optimiza los tiempos de respuesta del portal para los usuarios finales. |
| **TA-06** | **Estrategia de Logging Estructurado**                  | Observabilidad               | **Baja**  | Integración de un servicio de registro de eventos (logs) que captura errores críticos, intentos de inicio de sesión fallidos y tiempos de respuesta anómalos.                                         | • Proporciona visibilidad total sobre el comportamiento del sistema en producción.<br/>• Agiliza drásticamente el diagnóstico y resolución de fallos sin necesidad de depurar en caliente.                      |

---

## 7.4 Relación de tácticas y estrategias con los escenarios de calidad

Las tácticas y estrategias arquitectónicas fueron analizadas con el objetivo de responder a los escenarios de calidad definidos para el sistema, permitiendo fortalecer aspectos como:

- Seguridad y protección de la información.
- Escalabilidad progresiva del sistema.
- Disponibilidad y estabilidad operativa.
- Facilidad de despliegue y automatización.
- Desacoplamiento entre componentes.
- Mantenibilidad y evolución del software.
- Observabilidad y monitoreo de eventos.
- Optimización del rendimiento operativo.

Estas decisiones también permitieron establecer una arquitectura preparada para futuras integraciones, crecimiento funcional y adaptación tecnológica.

---

## 7.5 Relación con funcionalidades críticas

Las tácticas y estrategias implementadas también se alinean con las funcionalidades críticas del sistema, garantizando que procesos esenciales como autenticación, gestión de propiedades, comunicación con usuarios y administración operativa puedan ejecutarse de manera segura, confiable y escalable.

La implementación de patrones arquitectónicos, mecanismos de desacoplamiento y automatización contribuye directamente a reducir riesgos técnicos y mejorar la sostenibilidad del proyecto a largo plazo.

---

## 7.6 Observaciones arquitectónicas

Debido a la naturaleza evolutiva del proyecto, las tácticas y estrategias arquitectónicas pueden ajustarse progresivamente conforme aumenten las necesidades funcionales, los requerimientos del negocio y la complejidad operativa de la plataforma.

Por esta razón, la arquitectura fue diseñada buscando flexibilidad, modularidad y capacidad de adaptación frente a futuros cambios tecnológicos y organizacionales.

---

<p align="center">
  Arquitectura empresarial · Escenarios de calidad · Tácticas arquitectónicas · Estrategias de diseño
</p>

---

# 8. Arquetipo de solución

## 8.1 Definición e impacto en el diseño

Un arquetipo de solución representa una visión conceptual y estructural de la arquitectura del sistema, permitiendo identificar los principales componentes tecnológicos, sus relaciones y las responsabilidades que cumplen dentro de la solución.

Este arquetipo sirve como referencia arquitectónica para comprender cómo interactúan los distintos elementos del ecosistema tecnológico, facilitando la toma de decisiones relacionadas con integración, despliegue, seguridad, escalabilidad y mantenibilidad.

A diferencia de una arquitectura completamente implementada, el arquetipo de solución se construye de manera agnóstica, enfocándose en las capacidades necesarias del sistema más que en tecnologías específicas.

En el contexto de Inmuebles El Guarzo, el arquetipo de solución permitió establecer una estructura tecnológica base para soportar los procesos críticos del negocio inmobiliario, priorizando modularidad, automatización, seguridad y capacidad de evolución.

Además, este arquetipo orientó la selección de componentes desarrollados y adoptados, garantizando coherencia arquitectónica entre infraestructura, backend, servicios externos y mecanismos de integración.

---

## 8.2 Objetivos del arquetipo de solución

El arquetipo de solución fue definido con el propósito de:

- Establecer una visión arquitectónica global del sistema.
- Identificar los principales componentes funcionales y tecnológicos.
- Definir relaciones e interacciones entre módulos y servicios.
- Facilitar decisiones relacionadas con integración y despliegue.
- Garantizar alineación con atributos de calidad y restricciones técnicas.
- Promover escalabilidad, mantenibilidad y desacoplamiento.
- Servir como referencia para futuras evoluciones arquitectónicas.

---

## 8.3 Componentes del arquetipo de solución

| Componente                                   | Tipo de adquisición | Descripción                                                                                                                                                                                                                                                                                                | Justificación                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| :------------------------------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Web Application Firewall (WAF)**           | Adoptado            | Servicio perimetral de seguridad basado en la nube (ej. Cloudflare WAF) que intercepta el tráfico HTTP/HTTPS entrante.<br/><br/>_Referencia:_ [Cloudflare WAF Docs](https://www.cloudflare.com/es-es/learning/ddos/glossary/web-application-firewall-waf/)                                                 | Protege la aplicación de Inmuebles El Guarzo contra ataques web comunes (inyección SQL, XSS, CSRF, ataques de denegación de servicio) filtrando el tráfico malicioso antes de que llegue al sistema. Constituye la primera línea de defensa perimetral del catálogo público y los paneles privados, apoyando los siguientes drivers:<br/><br/>1. **SEG-C04-E01:** Sanitización y validación perimetral para neutralizar inyecciones antes de tocar la red.<br/>2. **SEG-C04-E05:** Limitación de peticiones (Rate Limiting) por origen para mitigar fuerza bruta.<br/>3. **DIS-C01:** Garantiza la disponibilidad operativa del catálogo público mitigando tráfico anómalo en horario laboral colombiano.<br/>4. **CFM-C01 (Legal):** Protege los datos personales recolectados en formularios conforme a la Ley 1581 de 2012.                                                                                                                                                                                                                                                                                                                                                                          |
| **Content Delivery Network (CDN)**           | Adoptado            | Red de servidores distribuidos geográficamente que almacenan en caché y sirven contenido estático de forma optimizada.<br/><br/>_Referencia:_ [Cloudflare CDN Docs](https://www.cloudflare.com/es-es/learning/cdn/what-is-a-cdn/)                                                                          | Asegura que el contenido estático del catálogo público de Inmuebles El Guarzo, incluyendo el sitio web del frontend y las fotografías de los inmuebles, pueda ser entregado al cliente o usuario final de forma rápida, eficiente, segura y comprimida desde nodos perimetrales cercanos geográficamente al usuario, apoyando los siguientes drivers:<br/><br/>1. **RF-38:** Carga del catálogo público en máximo 3 segundos con conexión normal en Colombia.<br/>2. **RF-42:** Carga de la ficha detallada de un inmueble en máximo 3 segundos con galería navegable de fotografías.<br/>3. **HU-49:** Carga del contenido textual y la primera imagen en máximo 5 segundos con conexión 3G desde dispositivos móviles.<br/>4. **Restricción de costo:** Reducción de carga sobre el servidor de aplicación para mantener el presupuesto mensual de $17 USD.                                                                                                                                                                                                                                                                                                                                           |
| **API Gateway**                              | Adoptado            | Punto de entrada unificado que centraliza, enruta y gestiona todas las solicitudes HTTP dirigidas al ecosistema del backend.<br/><br/>_Referencia:_ [IBM API Gateway Docs](https://www.ibm.com/es-es/topics/api-gateway)                                                                                   | Centraliza la entrada de todas las peticiones hacia el backend de Inmuebles El Guarzo, gestionando el enrutamiento, la validación de tokens de autenticación, el control de tasa de peticiones (rate limiting), la transformación de mensajes y el registro centralizado de tráfico, permitiendo separar las responsabilidades de seguridad perimetral de la lógica de negocio, apoyando los siguientes drivers:<br/><br/>1. **SEG-C04-E05:** Rate limiting en funcionalidades sensibles para prevenir abuso del sistema.<br/>2. **SEG-C01-E03:** Bloqueo temporal de cuentas tras 5 intentos fallidos consecutivos de inicio de sesión.<br/>3. **RF-14:** Verificación de permisos en el servidor para impedir evasión por manipulación del navegador.<br/>4. **CMNT-C04-E04:** Manejo centralizado de errores sin exponer información técnica sensible al cliente.                                                                                                                                                                                                                                                                                                                                    |
| **Frontend El Guarzo**                       | Desarrollado        | Aplicación web del lado del cliente construida con tecnologías modernas (ej. React o Next.js) que renderiza la interfaz de usuario.<br/><br/>_Referencia:_ [AWS Frontend Overview](https://aws.amazon.com/es/compare/the-difference-between-frontend-and-backend/)                                         | Implementa la interfaz de usuario con la que interactúan los clientes interesados en comprar o arrendar, los propietarios que desean publicar inmuebles, y los administradores y asesores que gestionan la operación inmobiliaria, proveyendo el catálogo público con filtros combinables, las fichas detalladas, los formularios de captación y los paneles privados de gestión, apoyando los siguientes drivers:<br/><br/>1. **USA-C01-E01:** Localización de inmuebles aplicando filtros de búsqueda en máximo 3 clics desde la página principal.<br/>2. **USA-C04-E01:** Filtros de búsqueda combinables con resultados actualizados dinámicamente sin recargar la página.<br/>3. **HU-49:** Interfaz responsiva adaptable a dispositivos móviles desde 360px de ancho.<br/>4. **USA-C02-E03:** Presentación de valores monetarios en formato colombiano con separadores de miles y símbolo de pesos.<br/>5. **HU-50:** Retroalimentación visual inmediata en máximo 3 segundos sobre el resultado de cada acción.                                                                                                                                                                                  |
| **Backend El Guarzo**                        | Desarrollado        | API REST robusta construida con un framework moderno (ej. NestJS) encargada de procesar las reglas de negocio del negocio inmobiliario.<br/><br/>_Referencia:_ [AWS Backend Overview](https://aws.amazon.com/es/compare/the-difference-between-frontend-and-backend/)                                      | Implementa la lógica de negocio del dominio inmobiliario de Inmuebles El Guarzo, incluyendo la máquina de estados del ciclo de vida de las ofertas, las validaciones de reglas de negocio, la gestión de inmuebles, la captación de propietarios y la atención de solicitudes de contacto, apoyando los siguientes drivers:<br/><br/>1. **CON-C02-E01:** Garantía de que las ofertas sigan estrictamente el ciclo de vida definido, rechazando transiciones no autorizadas.<br/>2. **HU-14:** Finalización automática de ofertas activas y actualización transaccional de la disponibilidad del inmueble al marcarlo como vendido.<br/>3. **RF-36:** Validación del canon de arriendo contra el 1% del valor comercial conforme al artículo 18 de la Ley 820 de 2003.<br/>4. **CON-C03:** Validación y completitud en el registro de información, rechazando registros incompletos o con datos contradictorios.<br/>5. **CON-C07:** Protección contra eliminación física de registros con dependencias activas.                                                                                                                                                                                         |
| **Identity Provider**                        | Adoptado            | Servicio encargado de gestionar el ciclo de vida de los perfiles de usuario, credenciales y asignación de tokens de acceso.<br/><br/>_Referencia:_ [Cloudflare IdP Docs](https://www.cloudflare.com/es-es/learning/access-management/what-is-an-identity-provider/)                                        | Gestiona la identidad y autenticación de los administradores y asesores de la inmobiliaria, encargándose de la verificación de credenciales, la emisión y validación de tokens JWT, las políticas de contraseñas, los flujos de verificación de cuentas en dos fases y los mecanismos de bloqueo por intentos fallidos, apoyando los siguientes drivers:<br/><br/>1. **SEG-C01-E01:** Autenticación con correo electrónico y contraseña verificados contra registros almacenados antes de conceder acceso.<br/>2. **SEG-C01-E03:** Bloqueo temporal de cuentas tras 5 intentos fallidos consecutivos durante mínimo 15 minutos.<br/>3. **SEG-C02-E02:** Almacenamiento de contraseñas usando algoritmo de hash seguro con salt individual.<br/>4. **SEG-C02-E03:** Mecanismo de recuperación de contraseña con enlace de un solo uso y vigencia de 30 minutos.<br/>5. **SEG-C07:** Creación y activación segura de cuentas mediante flujo de verificación por correo electrónico.                                                                                                                                                                                                                       |
| **Application Performance Management (APM)** | Adoptado            | Sistema de monitorización que rastrea la disponibilidad, errores y métricas de rendimiento en tiempo de ejecución de la aplicación.<br/><br/>_Referencia:_ [IBM APM Docs](https://www.ibm.com/es-es/topics/application-performance-management)                                                             | Monitorea en tiempo real el rendimiento de la aplicación de Inmuebles El Guarzo, capturando métricas de tiempos de respuesta, errores en producción, trazas distribuidas y salud del sistema, permitiendo detectar problemas de degradación del servicio antes de que afecten a los usuarios finales, apoyando los siguientes drivers:<br/><br/>1. **RF-21:** Validación en producción del tiempo de carga del formulario de edición de inmuebles en máximo 2 segundos.<br/>2. **RF-39:** Validación en producción de la respuesta de filtros del catálogo en máximo 3 segundos con hasta 2.000 inmuebles.<br/>3. **RF-50:** Validación en producción de búsquedas en el panel administrativo en máximo 2 segundos con más de 5.000 solicitudes.<br/>4. **HU-49:** Validación de tiempos de carga en máximo 5 segundos con conexión 3G desde dispositivos móviles.                                                                                                                                                                                                                                                                                                                                      |
| **Structured Logs Management**               | Adoptado            | Sistema centralizado de almacenamiento, indexación y análisis de trazas de eventos estructurados emitidos por la aplicación.<br/><br/>_Referencia:_ [Elastic Log Monitoring](https://www.elastic.co/es/what-is/log-monitoring)                                                                             | Centraliza la recolección, almacenamiento y consulta de las bitácoras estructuradas generadas por el backend, el frontend y los demás componentes del sistema, permitiendo la investigación de incidentes, el análisis de comportamiento del sistema y la auditoría operativa, apoyando los siguientes drivers:<br/><br/>1. **CMNT-C04:** Bitácoras estructuradas con niveles de criticidad, marca de tiempo en huso horario local e identificación del módulo de origen.<br/>2. **HU-30:** Consulta de registros de auditoría filtrando por entidad, usuario, operation y fechas con exportación a CSV/Excel.<br/>3. **HU-45:** Consulta del historial de inicios de sesión exitosos, intentos fallidos y cierres de sesión.<br/>4. **Restricción técnica:** Persistencia de registros de criticidad alta por mínimo 30 días para diagnóstico de incidentes.                                                                                                                                                                                                                                                                                                                                           |
| **Parameter Catalog**                        | Adoptado            | Módulo especializado para la gestión y aprovisionamiento dinámico de configuraciones globales y maestros de datos del sistema.<br/><br/>_Referencia:_ [Elastic Dynamic Config Concepts](https://www.elastic.co/es/what-is/log-monitoring)                                                                  | Centraliza la gestión de parámetros configurables del sistema (tipos de propiedad, comodidades, lugares cercanos, rangos de precios válidos, criterios de ordenamiento por defecto del catálogo) permitiendo al administrador modificarlos desde el panel administrativo sin necesidad de redespliegue del sistema, apoyando los siguientes drivers:<br/><br/>1. **HU-28:** Gestión de maestros de datos del catálogo (tipos de propiedad, subtipos, zonas, lugares cercanos, comodidades) con aplicación en menos de 10 segundos.<br/>2. **HU-38:** Configuración del rango válido de precios de inmuebles desde el panel administrativo.<br/>3. **HU-47:** Configuración del criterio de ordenamiento por defecto del catálogo público con reflejo en menos de 10 segundos.<br/>4. **HU-52:** Adición de nuevos atributos a las fichas de inmuebles sin afectar los registros existentes.<br/>5. **HU-27:** Gestión de canales de contacto de la inmobiliaria con reflejo en el catálogo público en máximo 10 segundos sin redespliegue.                                                                                                                                                              |
| **Notification Catalog**                     | Adoptado            | Plataforma centralizada para definir, gestionar y estructurar plantillas de mensajería y flujos de eventos de salida.<br/><br/>_Referencia:_ [Novu Template Concepts](https://docs.novu.co/concepts/templates)                                                                                             | Centraliza la gestión de plantillas de notificaciones del sistema y las reglas de envío asociadas, permitiendo al administrador modificar el contenido y la lógica de las notificaciones sin intervención del equipo de desarrollo, apoyando los siguientes drivers:<br/><br/>1. **RF-33:** Generación automática de alerta cuando una oferta permanezca en estado pausada por más de 15 días continuos.<br/>2. **RF-52:** Configuración de alerta visible en panel del administrador y notificación por correo cuando las solicitudes pendientes superen el umbral.<br/>3. **HU-15:** Configuración de alertas sobre ofertas pausadas con datos del inmueble, tiempo transcurrido y usuario que ejecutó la pausa.<br/>4. **HU-21:** Configuración de alertas sobre solicitudes pendientes acumuladas para administradores.                                                                                                                                                                                                                                                                                                                                                                             |
| **Message Catalog**                          | Adoptado            | Repositorio centralizado de cadenas de texto y localizaciones de mensajes para mantener consistencia idiomática y de interfaz.<br/><br/>_Referencia:_ [W3C Internationalization Standards](https://www.w3.org/International/questions/qa-i18n)                                                             | Centraliza la gestión de los textos del sistema, incluyendo mensajes de error, mensajes de validación, etiquetas de la interfaz y textos descriptivos, permitiendo mantener consistencia en el lenguaje del sistema, adaptar el contenido al contexto colombiano y modificar mensajes sin redespliegue, apoyando los siguientes drivers:<br/><br/>1. **HU-60:** Mensajes de error en lenguaje cotidiano que expliquen qué ocurrió y qué hacer para corregirlo, sin códigos técnicos.<br/>2. **USA-C02-E04:** Mensajes de error o validación en lenguaje claro evitando códigos genéricos como "Error 500".<br/>3. **HU-59:** Presentación de valores monetarios y fechas en formato colombiano con etiquetas descriptivas e indicadores visuales.<br/>4. **CMNT-C01-E01:** Comentarios y textos en español comprensibles para cualquier desarrollador colombiano.                                                                                                                                                                                                                                                                                                                                       |
| **Job Scheduler**                            | Adoptado            | Planificador de procesos asíncronos encargado de disparar tareas recurrentes en segundo plano según reglas de tiempo predefinidas.<br/><br/>_Referencia:_ [BMC Job Scheduling Overview](https://www-bmc-com.translate.goog/blogs/what-is-job-scheduling/?_x_tr_sl=en&_x_tr_tl=es&_x_tr_hl=es&_x_tr_pto=tc) | Ejecuta tareas programadas en segundo plano que el sistema requiere de forma automática, como la generación de alertas por ofertas pausadas durante más de 15 días, la verificación periódica del umbral de solicitudes de contacto pendientes y otras operaciones recurrentes que no requieren intervención manual del usuario, apoyando los siguientes drivers:<br/><br/>1. **RF-33:** Alerta cuando una oferta permanezca pausada más de 15 días calendario.<br/>2. **RF-52:** Alerta cuando solicitudes pendientes superen 15 en un período de 2 horas.<br/>3. **CON-C05-E05:** Notificación por correo al administrador en máximo 5 minutos desde que se supera el umbral.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| **Relational Database (SQL)**                | Adoptado            | Motor de bases de datos relacional (ej. PostgreSQL) enfocado en mantener la integridad y consistencia de los datos del dominio.<br/><br/>_Referencia:_ [Oracle Relational Database Overview](https://www.oracle.com/co/database/what-is-a-relational-database/)                                            | Almacena de forma estructurada y persistente los datos del dominio inmobiliario de Inmuebles El Guarzo, incluyendo inmuebles, ofertas, usuarios, solicitudes de contacto, solicitudes de publicación, registros de auditoría y configuraciones del sistema. Garantiza la integridad referencial entre entidades relacionadas y soporta transacciones atómicas para operaciones que afectan múltiples registros, apoyando los siguientes drivers:<br/><br/>1. **HU-14:** Transacciones atómicas ACID para finalización de ventas.<br/>2. **CON-C07:** Integridad referencial mandatoria con claves foráneas (foreign keys).<br/>3. **SEG-C02-E02:** Almacenamiento seguro de contraseñas con hash y salt.<br/>4. **CON-C04-E03:** Preservación estricta de datos confirmados tras caída del servidor.<br/>5. **Restricción legal:** Ley 1581 de 2012: registro de fecha y medio de autorización de datos personales.<br/>6. **Restricción de negocio:** $0 USD en licencias de base de datos aplicando uso de free tier obligatorio.                                                                                                                                                                     |
| **Blob Storage**                             | Adoptado            | Servicio en la nube optimizado para almacenar objetos masivos no estructurados, especialmente archivos estáticos multimedia.<br/><br/>_Referencia:_ [Microsoft Azure Blob Storage Docs](https://learn.microsoft.com/es-es/azure/storage/blobs/storage-blobs-introduction)                                  | Almacena los archivos multimedia del sistema, principalmente las fotografías de los inmuebles cargadas por administradores y asesores, de forma desacoplada del servidor de aplicación. Permite escalar el almacenamiento de imágenes de forma independiente al crecimiento del catálogo y servirlas eficientemente a través del CDN, apoyando los siguientes drivers:<br/><br/>1. **Restricción de negocio:** Almacenamiento de imágenes desacoplado físicamente del servidor de aplicación.<br/>2. **RF-24:** Soporte para máximo 15 imágenes por inmueble, admitiendo hasta 10 MB por imagen raw.<br/>3. **RF-26:** Mecanismo de compresión automática a máximo 2 MB con generación paralela de miniatura.<br/>4. **SEG-C06-E01:** Validación de formato real de archivos verificando las cabeceras binarias (magic numbers).<br/>5. **CON-C01-E03:** Almacenar la totalidad de imágenes sin pérdida y respetando el orden definido por el usuario.                                                                                                                                                                                                                                                  |
| **Cache**                                    | Adoptado            | Almacenamiento en memoria volátil de alta velocidad (ej. Redis) utilizado para agilizar la lectura de datos de acceso frecuente.<br/><br/>_Referencia:_ [AWS Caching Overview](https://aws.amazon.com/es/caching/)                                                                                         | Almacena temporalmente en memoria los resultados de operaciones costosas o consultas frecuentes, reduciendo la carga sobre la base de datos relacional y mejorando los tiempos de respuesta del sistema, apoyando los siguientes drivers:<br/><br/>1. **RF-39:** Aplicación dinámica de filtros del catálogo público con respuesta en máximo 2 segundos y resultados de búsquedas combinadas en máximo 3 segundos con hasta 2.000 inmuebles.<br/>2. **RF-50:** Filtrado de solicitudes de contacto en máximo 2 segundos incluso con más de 5.000 registros.<br/>3. **USA-C05-E03:** Búsqueda de inmuebles u ofertas específicas en el panel administrativo sin demora perceptible para el usuario.<br/>4. **RF-46:** Reflejo de cambios de estado o precio en el catálogo público en máximo 2 minutos manteniendo la consistencia.                                                                                                                                                                                                                                                                                                                                                                      |
| **Notification Gateway**                     | Adoptado            | Pasarela externa especializada en el enrutamiento y entrega confiable de correos electrónicos corporativos y transaccionales.<br/><br/>_Referencia:_ [Capterra Push & Email Gateways](https://www.capterra.co/software/177426/push-notification-gateway)                                                   | Resuelve la entrega de correos en al menos 6 flujos diferentes (verificación de cuenta, recuperación de contraseña, confirmación a propietarios, aceptación/rechazo, alertas al admin y notificación de venta) de manera confiable, evitando implementar un servidor propio complejo, apoyando los siguientes drivers:<br/><br/>1. **HU-04:** Envío de correo de verificación para habilitar cuentas de asesor.<br/>2. **RF-07:** Envío seguro de enlaces de recuperación de contraseña.<br/>3. **CON-C05-E08:** Confirmación transaccional automática al propietario en máximo 2 minutos.<br/>4. **CON-C05-E09:** Asegura la entrega confiable de notificaciones al propietario sin caer en bandejas de spam.<br/>5. **Restricción de negocio:** Costo operativo menor a $5 USD mensuales mediante tiers de uso gratuito.                                                                                                                                                                                                                                                                                                                                                                              |
| **CAPTCHA Service**                          | Adoptado            | Servicio de validación automatizada diseñado para discernir de forma no intrusiva entre interacciones humanas y bots maliciosos.<br/><br/>_Referencia:_ [Cloudflare CAPTCHA Learning](https://www.cloudflare.com/es-es/learning/bots/how-captchas-work/)                                                   | Protege los tres puntos de entrada públicos que no requieren autenticación (formulario de contacto, formulario de publicación de propietario y login) previniendo que bots generen spam masivo, saturen las bandejas, agoten las cuotas mensuales de correos o degraden el sistema, apoyando los siguientes drivers:<br/><br/>1. **SEG-C01-E06:** Despliegue de CAPTCHA en login tras el segundo intento fallido de autenticación.<br/>2. **SEG-C04-E06:** Protección mandatoria con CAPTCHA en el formulario público de solicitud de contacto.<br/>3. **SEG-C04-E07:** Protección con CAPTCHA en el formulario de publicación externa de propietarios.<br/>4. **Restricción de negocio:** Proteger estrictamente la cuota limitada del servicio de correo electrónico ($5 USD/mes).                                                                                                                                                                                                                                                                                                                                                                                                                    |
| **Key Vault**                                | Adoptado            | Almacén criptográfico seguro y centralizado para la administración de credenciales sensibles, secretos y claves de API.<br/><br/>_Referencia:_ [Microsoft Azure Key Vault Docs](https://learn.microsoft.com/es-es/azure/key-vault/general/overview)                                                        | Almacena de forma segura y centralizada los secretos, claves de cifrado, credenciales de servicios externos y variables de entorno sensibles utilizadas por el sistema. Evita la exposición de credenciales en el código fuente o en archivos de configuración, apoyando los siguientes drivers:<br/><br/>1. **SEG-C02-E02:** Credenciales cifradas no legibles en texto plano bajo ninguna circunstancia dentro de los repositorios.<br/>2. **Restricción técnica:** Las respuestas del servidor no deben exponer información o credenciales técnicas sensibles en las cabeceras.<br/>3. **Restricción técnica:** Archivo `.env.example` documentado de manera pública sin contener valores reales de producción.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| **CI/CD Pipeline**                           | Adoptado            | Flujo automatizado de integración y despliegue continuo encargado de compilar, probar y distribuir el software sin intervención manual.<br/><br/>_Referencia:_ [Red Hat CI/CD Overview](https://www.redhat.com/es/topics/devops/what-is-ci-cd)                                                             | Automatiza los despliegues y pruebas debido a la restricción del tamaño reducido del equipo, garantizando que solo código validado llegue a producción de forma consistente y minimizando errores humanos de configuración, apoyando los siguientes drivers:<br/><br/>1. **Restricción técnica:** Integración continua obligatoria completando el proceso de build en menos de 8 minutos.<br/>2. **Restricción técnica:** Cobertura de pruebas automatizadas mínima del 70% en la capa de lógica de negocio.<br/>3. **Restricción técnica:** Ejecución mandatoria de pruebas de integración para los 3 flujos más críticos del sistema.<br/>4. **Restricción técnica:** Despliegues de alta disponibilidad con un máximo de 30 segundos de inactividad técnica.<br/>5. **Restricción técnica:** Ejecución de smoke tests post-despliegue automáticos verificando catálogo, contacto y accesibilidad del panel.<br/>6. **Restricción técnica:** Capacidad de ejecución de rollback inmediato al último estado estable en un tiempo máximo de 10 minutos.<br/>7. **Restricción técnica:** Control de calidad estricto mediante revisión de pares obligatoria antes de realizar merge a la rama principal. |

---

## 8.4 Relaciones e interacción entre componentes

Los componentes definidos dentro del arquetipo de solución interactúan de manera coordinada para soportar las funcionalidades críticas del sistema y cumplir los atributos de calidad priorizados.

La arquitectura propuesta promueve desacoplamiento entre responsabilidades, separación de capas y comunicación controlada entre componentes internos y servicios externos, permitiendo una evolución progresiva de la plataforma sin comprometer la estabilidad del núcleo del negocio.

Asimismo, la combinación de componentes desarrollados y adoptados permite optimizar tiempos de implementación, reutilizar capacidades existentes y reducir complejidad operativa en distintos escenarios del sistema.

---

## 8.5 Diagrama del arquetipo de solución

El siguiente diagrama representa el arquetipo de solución propuesto para Inmuebles El Guarzo, mostrando los principales componentes arquitectónicos y sus relaciones dentro del ecosistema tecnológico de la plataforma.

<p align="center">
  <img
    src="./assets/architecture/arquetipo-solucion.png"
    width="1000"
    alt="Arquetipo de solución"
  />
</p>

---

## 8.6 Consideraciones arquitectónicas

El arquetipo de solución fue diseñado siguiendo principios de modularidad, separación de responsabilidades y arquitectura cloud-native, buscando garantizar:

- Escalabilidad progresiva del sistema.
- Flexibilidad frente a cambios tecnológicos.
- Seguridad e integridad de la información.
- Automatización operativa y despliegues consistentes.
- Mantenibilidad y facilidad de evolución.
- Integración eficiente con servicios externos.

Estas decisiones arquitectónicas permiten que la plataforma pueda crecer de manera sostenible conforme evolucionen las necesidades del negocio y aumente la complejidad operativa del sistema.

---

<p align="center">
  Arquetipo de solución · Arquitectura cloud-native · Integración de componentes · Diseño empresarial
</p>

---

# 9. Arquitectura de solución

## 9.1 Definición e impacto en el diseño

La arquitectura de solución representa la materialización tecnológica del sistema, definiendo de manera concreta los componentes, plataformas, servicios, frameworks y herramientas seleccionadas para implementar la solución.

A diferencia del arquetipo de solución, que describe una visión conceptual y agnóstica de la arquitectura, la arquitectura de solución especifica las tecnologías reales adoptadas dentro del proyecto, permitiendo comprender cómo será construido, desplegado y operado el sistema.

En el contexto de Inmuebles El Guarzo, la arquitectura de solución fue diseñada buscando equilibrio entre escalabilidad, mantenibilidad, seguridad, automatización y optimización de costos, priorizando tecnologías modernas compatibles con entornos cloud-native y prácticas DevOps.

Además, esta arquitectura permite establecer estándares técnicos consistentes para el desarrollo del backend, integración de servicios externos, automatización de despliegues y administración de infraestructura.

---

## 9.2 Objetivos de la arquitectura de solución

La arquitectura de solución fue definida con los siguientes objetivos:

- Materializar técnicamente el arquetipo de solución.
- Definir tecnologías concretas para cada capacidad del sistema.
- Garantizar alineación con atributos de calidad y restricciones técnicas.
- Facilitar escalabilidad y evolución progresiva del proyecto.
- Promover automatización y despliegues consistentes.
- Reducir acoplamiento entre componentes tecnológicos.
- Optimizar costos operativos y de infraestructura.
- Mejorar seguridad, monitoreo y mantenibilidad del sistema.

---

## 9.3 Componentes tecnológicos de la arquitectura de solución

| Componente / Elemento arquitectónico | Fabricante                                          | Nombre Comercial             | Versión                   | Tipo Licenciamiento                                 | Adquisición  | Justificación                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Motivación (Opcional)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| :----------------------------------- | :-------------------------------------------------- | :--------------------------- | :------------------------ | :-------------------------------------------------- | :----------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Web Application Firewall (WAF)**   | Cloudflare Inc.                                     | Cloudflare WAF               | Plan Free                 | Propietario - Free Tier                             | Adoptado     | Provee protección perimetral contra ataques OWASP Top 10 sin costo, alineado con el presupuesto de $17 USD/mes y la restricción de $0 en licencias. La integración con el ecosistema Cloudflare (R2, CDN, Turnstile) reduce complejidad operativa. Se comparó Cloudflare WAF frente a AWS WAF, Azure WAF y ModSecurity. AWS WAF y Azure WAF se descartaron por sus costos basados en peticiones, impredecibles y que exceden el presupuesto fijo del proyecto. ModSecurity es open source y gratuito pero requiere autohospedaje, configuración manual de reglas y mantenimiento continuo, inviable para un equipo de dos personas. Cloudflare WAF en plan gratuito ofrece reglas administradas contra OWASP Top 10 sin configuración compleja, integración nativa con el resto del ecosistema Cloudflare ya seleccionado (CDN, R2, Turnstile), y cero costo de licencia.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Sirve como primera barrera de defensa que filtra el tráfico malicioso antes de que toque cualquier componente del sistema. Ofrece reglas administradas contra OWASP Top 10 actualizadas continuamente, protección DDoS automática, mitigación de bots y geobloqueo configurable, todo sin requerir mantenimiento ni configuración compleja por parte del equipo. Reduce significativamente la superficie de ataque del catálogo público y los paneles privados sin consumir recursos del servidor de aplicación.                                                  |
| **Content Delivery Network (CDN)**   | Cloudflare Inc.                                     | Cloudflare CDN               | Plan Free                 | Propietario - Free Tier                             | Adoptado     | Distribución global de contenido estático con caché perimetral. Integración nativa con WAF y R2 del mismo ecosistema. Cumple el requisito de carga del catálogo en menos de 3 segundos (RF-38). Se comparó Cloudflare CDN frente a AWS CloudFront, Fastly y Azure CDN. AWS CloudFront y Azure CDN cobran por tráfico de salida, generando costos variables que ponen en riesgo el presupuesto fijo, especialmente en un catálogo donde cada visita implica descarga de múltiples imágenes. Fastly tiene excelente rendimiento pero su plan gratuito es limitado y orientado a casos de prueba. Cloudflare CDN ofrece tráfico ilimitado en plan gratuito, presencia en más de 300 ciudades incluyendo Latinoamérica, e integración nativa con WAF y R2 ya seleccionados.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Sirve como capa de distribución global del contenido estático del catálogo, entregando el frontend y las fotografías de inmuebles desde nodos perimetrales cercanos al usuario en Colombia. Ofrece caché automático, compresión de archivos, optimización de imágenes y reducción de hasta el 80% en tiempos de respuesta, descargando al servidor de aplicación de servir contenido estático y mejorando significativamente la experiencia del cliente final.                                                                                                    |
| **API Gateway**                      | Kong Inc.                                           | Kong Gateway (Open Source)   | 3.x                       | Apache 2.0                                          | Adoptado     | Estándar de la industria para API Gateway. Provee separación física de las responsabilidades de seguridad perimetral (rate limiting, validación de tokens, enrutamiento, transformaciones) respecto a la lógica de negocio. Apache 2.0, sin costo de licencia. Permite que las políticas de seguridad evolucionen independientemente del Backend. Se comparó Kong Gateway (Open Source) frente a AWS API Gateway, Traefik y Tyk. AWS API Gateway se descartó por su modelo de cobro por peticiones que excede el presupuesto del proyecto. Tyk es robusto pero su versión open source tiene funcionalidades limitadas frente a la versión enterprise de pago. Traefik es más simple y moderno, pero está orientado principalmente a enrutamiento de microservicios en entornos Kubernetes y ofrece menos plugins de seguridad maduros. Kong Gateway en su versión Open Source bajo licencia Apache 2.0 es el estándar de la industria para API Gateway, ofrece plugins maduros para rate limiting, autenticación JWT, transformaciones y logging, y tiene amplia documentación, lo que reduce la curva de aprendizaje del equipo.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Sirve como punto único de entrada para todas las peticiones hacia el backend, centralizando responsabilidades de seguridad perimetral, control de tráfico y observabilidad. Ofrece rate limiting configurable por endpoint, validación previa de tokens JWT, transformación de mensajes, registro centralizado de tráfico y plugins maduros para integración con identidad y monitoreo, permitiendo que el Backend se concentre exclusivamente en la lógica de negocio.                                                                                           |
| **Frontend**                         | Equipo Inmuebles El Guarzo                          | Frontend Inmuebles El Guarzo | 1.0                       | Propietario                                         | Desarrollado | Implementa la interfaz de usuario del catálogo público, paneles de administrador y asesor, y formularios de captación de propietarios.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Sirve como la cara visible del sistema para todos los actores del negocio: clientes que exploran el catálogo, propietarios que ofrecen inmuebles, asesores que gestionan ofertas y administradores que supervisan la operación. Ofrece interfaz responsiva adaptable a dispositivos móviles y de escritorio, filtros dinámicos del catálogo, formularios validados, panel administrativo con métricas en tiempo real y experiencia de usuario alineada con las convenciones colombianas de presentación.                                                          |
| **Backend**                          | Equipo Inmuebles El Guarzo                          | Backend Inmuebles El Guarzo  | 1.0                       | Propietario                                         | Desarrollado | Implementa la lógica de negocio específica del dominio inmobiliario El Guarzo: máquina de estados de ofertas, validaciones, flujos de captación, gestión de inmuebles y solicitudes.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Sirve como el núcleo lógico que ejecuta todas las reglas del negocio inmobiliario: validaciones, máquina de estados de ofertas, gestión transaccional de inmuebles, procesamiento de solicitudes y orquestación de servicios externos. Ofrece API REST documentada automáticamente, control de acceso basado en roles, manejo centralizado de errores, integridad transaccional con la base de datos y trazabilidad completa de operaciones para auditoría conforme a la Ley 1581 de 2012.                                                                        |
| **Identity Provider**                | Supabase Inc.                                       | Supabase Auth                | 2.x — Plan Free           | Apache 2.0 (core) / Free Tier (servicio gestionado) | Adoptado     | Gestiona la autenticación, emisión y validación de tokens JWT, políticas de contraseñas, flujos de verificación de cuentas y recuperación de credenciales mediante un servicio externo especializado en identidad. Cubre los requisitos de autenticación del proyecto (RF-01 al RF-12) sin asumir la responsabilidad de implementar criptografía, hashing y gestión de sesiones desde cero, lo cual reduce significativamente la superficie de riesgo de seguridad del sistema. Se comparó Supabase Auth frente a Keycloak (autohospedado), Auth0 y Clerk. Keycloak es el estándar enterprise bajo Apache 2.0 pero requiere un servidor adicional para autohospedarse con consumo mínimo de 512 MB de RAM, lo cual excedería el presupuesto fijo de $17 USD/mes del proyecto y la capacidad operativa de un equipo de dos personas. Auth0 ofrece producto maduro líder del mercado pero su plan gratuito está limitado a 25.000 usuarios activos mensuales y tiene restricciones en personalización de la experiencia de marca. Clerk tiene excelente experiencia de desarrollo y componentes prefabricados para React pero su plan gratuito está limitado a 10.000 usuarios mensuales y está más orientado a startups que a sistemas con requisitos específicos del contexto colombiano. Supabase Auth ofrece plan gratuito de 50.000 usuarios activos mensuales (suficiente para el horizonte del proyecto), SDK oficial para JavaScript/TypeScript con integración directa en NestJS y React, soporte nativo para los flujos requeridos (verificación por correo, recuperación con enlaces de un solo uso, políticas de contraseñas, bloqueo por intentos fallidos, OAuth, MFA), y la base del servicio es Apache 2.0 lo cual permite migrar a autohospedaje en el futuro si se requiere control total sobre los datos para reforzar el cumplimiento de la Ley 1581 de 2012. | Sirve como el componente especializado que gestiona toda la identidad y autenticación de los usuarios del sistema (administradores y asesores), liberando al equipo de implementar criptografía, hashing y gestión de sesiones desde cero. Ofrece flujos completos y probados de inicio de sesión, registro con verificación por correo, recuperación de contraseña con enlaces de un solo uso, bloqueo automático por intentos fallidos, MFA opcional y emisión de tokens JWT estándar, todo bajo plan gratuito y con SDK oficial integrable con NestJS y React. |
| **Blob Storage**                     | Cloudflare Inc.                                     | Cloudflare R2                | Plan Free                 | Propietario - Free Tier                             | Adoptado     | Almacenamiento de objetos compatible con API S3 sin costos de egreso, crítico para un catálogo donde cada vista implica descarga de imágenes. Plan gratuito de 10 GB suficiente dado el límite de 15 imágenes por inmueble comprimidas a 2 MB (RF-24, RF-26). Cumple la restricción de desacoplamiento del servidor de aplicación. Se comparó Cloudflare R2 frente a Amazon S3, Google Cloud Storage y Backblaze B2. Amazon S3 es el estándar de la industria pero cobra significativamente por tráfico de salida, generando gastos impredecibles en un catálogo con muchas visitas. Google Cloud Storage tiene estructura de costos similar a S3. Backblaze B2 es económico pero su CDN integrado tiene menor presencia global que Cloudflare. Cloudflare R2 ofrece almacenamiento compatible con la API S3, cero costo de tráfico de salida (decisivo para el modelo de uso del proyecto), plan gratuito de 10 GB suficientes para el volumen estimado, e integración nativa con el CDN y WAF de Cloudflare.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Sirve como repositorio centralizado y desacoplado para las fotografías de los inmuebles, permitiendo escalar el almacenamiento de manera independiente al servidor de aplicación. Ofrece almacenamiento compatible con la API de S3, cero costos de tráfico de salida (decisivo para un catálogo donde cada visita descarga múltiples imágenes), integración nativa con el CDN para distribución eficiente y plan gratuito de 10 GB suficiente para el volumen estimado del proyecto.                                                                             |
| **Caché Distribuido**                | Upstash, Inc. (sobre Redis)                         | Upstash Redis                | Redis 7.x — Plan Free     | Propietario - Free Tier (Redis BSD-3)               | Adoptado     | Servicio de caché distribuido completamente gestionado bajo modelo serverless. Plan gratuito de 10.000 comandos diarios y 256 MB. No requiere mantenimiento de infraestructura. Redis es el estándar de facto para caché distribuido. Se comparó Upstash Redis frente a Memcached, Hazelcast y Redis autohospedado. Memcached es simple y rápido pero carece de tipos de datos avanzados (listas, hashes, sorted sets) y persistencia, limitando casos de uso futuros. Hazelcast es enterprise-grade pero su complejidad operativa y consumo de recursos exceden las necesidades del proyecto. Redis autohospedado en el mismo servidor compite por los limitados 512 MB de RAM del backend, afectando el rendimiento general. Upstash Redis ofrece Redis 7.x serverless, plan gratuito generoso, sin costos fijos, y elimina la necesidad de mantener infraestructura adicional.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Sirve como capa de aceleración de respuestas para consultas frecuentes del catálogo público y datos de sesión, reduciendo la carga sobre la base de datos relacional y mejorando los tiempos de respuesta de la aplicación. Ofrece almacenamiento en memoria con persistencia opcional, soporte para estructuras de datos avanzadas (listas, hashes, sorted sets), modelo serverless sin necesidad de mantener infraestructura y plan gratuito que cubre el volumen inicial del proyecto.                                                                         |
| **Base de datos relacional**         | The PostgreSQL Global Development Group / Neon Inc. | PostgreSQL en Neon           | PostgreSQL 16 — Plan Free | PostgreSQL License + Free Tier                      | Adoptado     | Dominio claramente relacional con dependencias estrictas. PostgreSQL provee transacciones atómicas para flujos como HU-14, soporte JSONB para auditoría, búsqueda de texto completo (RF-39) y restricciones declarativas. Neon ofrece motor gestionado con branching para entornos de prueba. Se comparó PostgreSQL en Neon frente a MySQL en PlanetScale, Supabase Database y MariaDB en Aiven. MySQL en PlanetScale es robusto pero PlanetScale eliminó su plan gratuito en 2024, excediendo el presupuesto. Supabase Database está basada en PostgreSQL pero está optimizada para proyectos que usan todo el ecosistema Supabase, lo cual no aplica al proyecto. MariaDB en Aiven tiene buen plan gratuito pero MariaDB carece del soporte completo de tipos JSONB y búsqueda de texto avanzada de PostgreSQL. Neon ofrece PostgreSQL 16 completamente gestionado con plan gratuito de 0.5 GB, branching de bases de datos para entornos de prueba aislados, autoscaling, y la fortaleza nativa de PostgreSQL en transacciones, JSONB y full-text search.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Sirve como el repositorio persistente de toda la información estructurada del dominio inmobiliario: inmuebles, ofertas, usuarios, solicitudes, auditoría y configuraciones. Ofrece transacciones ACID estrictas indispensables para operaciones críticas como la finalización automática de ofertas, integridad referencial fuerte para proteger las relaciones entre entidades, soporte de tipos avanzados como JSONB para auditoría, búsqueda de texto completo para los filtros del catálogo y branching de bases de datos para entornos de prueba aislados.   |

> _Nota:_ El archivo original contiene 50 componentes tecnológicos registrados. Debido a la extensión del contenido, aquí se muestran los principales componentes estratégicos de la arquitectura.

---

## 9.4 Relación entre componentes tecnológicos

La arquitectura de solución integra múltiples componentes tecnológicos especializados que trabajan de manera coordinada para soportar las funcionalidades críticas y atributos de calidad priorizados del sistema.

La interacción entre backend, bases de datos, herramientas DevOps, mecanismos de seguridad y servicios externos permite construir una plataforma desacoplada, escalable y preparada para evolucionar progresivamente conforme aumenten las necesidades del negocio.

Asimismo, la adopción de tecnologías cloud-native y herramientas de automatización favorece la reducción de complejidad operativa y mejora la consistencia de despliegues en distintos entornos.

---

## 9.5 Diagrama de arquitectura de solución

El siguiente diagrama representa la arquitectura de solución implementada para Inmuebles El Guarzo, mostrando los componentes tecnológicos concretos, sus relaciones y las principales integraciones del sistema.

<p align="center">
  <img
    src="./assets/architecture/arquitectura-solucion.png"
    width="1100"
    alt="Arquitectura de solución"
  />
</p>

---

## 9.6 Consideraciones tecnológicas

La selección de tecnologías dentro de la arquitectura de solución se realizó considerando criterios relacionados con:

- Compatibilidad con arquitectura cloud-native.
- Facilidad de integración y automatización.
- Comunidad y soporte tecnológico.
- Escalabilidad y mantenibilidad.
- Seguridad y estabilidad operativa.
- Curva de aprendizaje y productividad del equipo.
- Costos operativos y disponibilidad de servicios.

Estas decisiones permiten construir una plataforma moderna, flexible y alineada con las necesidades actuales y futuras del proyecto.

---

<p align="center">
  Arquitectura de solución · Cloud Native · Integración tecnológica · DevOps · Escalabilidad
</p>

---

# 10. Diagramas de componentes

## 10.1 Definición e impacto en el diseño

Un diagrama de componentes representa la organización estructural de los principales módulos, servicios y elementos funcionales que conforman un sistema de software, mostrando sus responsabilidades y relaciones de interacción.

Este tipo de diagramas permite visualizar cómo se divide la solución en componentes desacoplados, facilitando la comprensión de la arquitectura interna del sistema y la distribución de responsabilidades técnicas y funcionales.

En el contexto de Inmuebles El Guarzo, los diagramas de componentes fueron utilizados para representar la organización del backend y frontend de la plataforma, permitiendo identificar módulos funcionales, capas arquitectónicas, integraciones y relaciones entre componentes principales del sistema.

Además, estos diagramas sirven como apoyo para tareas de mantenimiento, evolución tecnológica, incorporación de nuevas funcionalidades y comunicación arquitectónica dentro del equipo de desarrollo.

---

## 10.2 Diagrama de componentes del backend

### 10.2.1 Descripción general

El diagrama de componentes del backend representa la estructura modular del sistema, mostrando los principales módulos funcionales, capas arquitectónicas, servicios internos y componentes de infraestructura que soportan la lógica de negocio de la plataforma.

La organización propuesta sigue principios de Clean Architecture y modularidad, buscando mantener separación clara de responsabilidades y desacoplamiento entre dominio, aplicación e infraestructura.

---

### 10.2.2 Componentes identificados

| Componente                      | Descripción                                                                                                                                                                                                         |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Cloudflare WAF**              | Firewall de aplicaciones web encargado de filtrar tráfico HTTP/HTTPS malicioso antes de que llegue al backend. Implementa protección contra ataques OWASP Top 10, mitigación DDoS y reglas de seguridad perimetral. |
| **Cloudflare Turnstile**        | Servicio CAPTCHA utilizado para validar interacciones humanas en formularios del sistema, evitando bots y ataques automatizados sobre endpoints públicos.                                                           |
| **Kong Gateway**                | API Gateway encargado del enrutamiento de peticiones hacia el backend, aplicación de políticas de seguridad, rate limiting y validación de tokens JWT.                                                              |
| **NestJS**                      | Framework principal utilizado para desarrollar el backend bajo arquitectura modular y orientada a servicios utilizando TypeScript y Node.js.                                                                        |
| **Node.js**                     | Runtime de ejecución del backend encargado de interpretar y ejecutar el código JavaScript/TypeScript del servidor.                                                                                                  |
| **Inmuebles-el-guarzo-backend** | Servicio principal del backend que implementa toda la lógica de negocio inmobiliaria, gestión de inmuebles, autenticación, solicitudes, ofertas y administración del sistema.                                       |
| **Docker**                      | Plataforma de contenedorización utilizada para empaquetar y desplegar el backend junto con todas sus dependencias en ambientes reproducibles.                                                                       |
| **Upstash Redis**               | Servicio de caché distribuido utilizado para almacenamiento temporal de datos frecuentes, optimización de consultas y reducción de carga sobre la base de datos relacional.                                         |
| **Doppler**                     | Servicio de gestión segura de secretos y variables de entorno utilizado para centralizar credenciales, tokens y configuraciones sensibles del backend.                                                              |
| **Supabase Auth**               | Servicio de autenticación encargado de gestionar usuarios, validación de credenciales, emisión y verificación de tokens JWT.                                                                                        |
| **Prisma ORM**                  | ORM utilizado para mapear entidades del dominio inmobiliario hacia la base de datos PostgreSQL, facilitando consultas tipadas y migraciones.                                                                        |
| **PostgreSQL/Neon**             | Base de datos relacional principal del sistema encargada de almacenar inmuebles, usuarios, solicitudes, auditoría y demás datos persistentes del negocio.                                                           |
| **Resend**                      | Servicio de envío de correos electrónicos transaccionales utilizado para notificaciones, recuperación de contraseñas y validaciones de cuenta.                                                                      |
| **Novu**                        | Plataforma de gestión de notificaciones utilizada para administrar plantillas y flujos de comunicación del sistema.                                                                                                 |
| **Sentry**                      | Plataforma de monitoreo y observabilidad utilizada para registrar errores, excepciones y trazabilidad del backend en tiempo real.                                                                                   |
| **GitHub Actions**              | Servicio de integración y despliegue continuo (CI/CD) utilizado para automatizar pruebas, construcción y despliegue del backend.                                                                                    |
| **SonarCloud**                  | Plataforma de análisis de calidad de código utilizada para inspección estática, detección de vulnerabilidades y control de mantenibilidad del backend.                                                              |
| **Hosting Starter ($7/mes)**    | Infraestructura de hosting utilizada para desplegar y ejecutar el contenedor Docker del backend en producción.                                                                                                      |

---

### 10.2.3 Diagrama de componentes del backend

<p align="center">
  <img
    src="./assets/diagrams/backend-components.png"
    width="1100"
    alt="Diagrama de componentes del backend"
  />
</p>

---

## 10.3 Diagrama de componentes del frontend

### 10.3.1 Descripción general

El diagrama de componentes del frontend representa la organización estructural de la interfaz de usuario, mostrando páginas, módulos visuales, componentes reutilizables, mecanismos de navegación y servicios de comunicación con el backend.

Este diagrama permite comprender cómo se distribuyen las responsabilidades dentro de la capa de presentación y cómo interactúan los distintos componentes de experiencia de usuario.

La arquitectura frontend fue diseñada buscando reutilización, mantenibilidad, escalabilidad visual y separación lógica entre componentes de interfaz y lógica de consumo de servicios.

---

### 10.3.2 Componentes identificados

| Componente                       | Descripción                                                                                                                                                               |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **React 18 + Vite 5**            | Framework y herramienta de construcción utilizados para desarrollar el frontend del sistema como una aplicación web moderna, reactiva y optimizada para alto rendimiento. |
| **Inmuebles-el-guarzo-frontend** | Aplicación frontend principal encargada de la interfaz de usuario del catálogo inmobiliario, panel administrativo y formularios interactivos del sistema.                 |
| **Cloudflare WAF**               | Firewall de aplicaciones web encargado de proteger el frontend contra tráfico malicioso, ataques automatizados y vulnerabilidades web comunes.                            |
| **Cloudflare Turnstile**         | Servicio CAPTCHA utilizado para validar usuarios reales en formularios públicos del frontend, evitando bots y envíos automatizados.                                       |
| **Supabase Auth**                | Servicio de autenticación integrado en el frontend para gestionar inicio de sesión, recuperación de contraseñas, sesiones y validación de usuarios.                       |
| **Kong Gateway**                 | API Gateway utilizado como punto de acceso entre el frontend y el backend, gestionando enrutamiento seguro de peticiones y control de acceso.                             |
| **Vercel**                       | Plataforma de hosting y despliegue utilizada para publicar el frontend en producción con integración continua y distribución optimizada.                                  |
| **GitHub Actions**               | Servicio CI/CD utilizado para automatizar procesos de construcción, pruebas y despliegue continuo del frontend.                                                           |
| **SonarCloud**                   | Plataforma de análisis de calidad de código utilizada para inspección estática, mantenibilidad y detección de vulnerabilidades en el frontend.                            |

---

### 10.3.3 Diagrama de componentes del frontend

<p align="center">
  <img
    src="./assets/diagrams/frontend-components.png"
    width="1100"
    alt="Diagrama de componentes del frontend"
  />
</p>

---

## 10.4 Relación entre componentes del sistema

Los componentes definidos dentro del backend y frontend interactúan de manera coordinada para soportar las funcionalidades críticas del sistema y garantizar el cumplimiento de los atributos de calidad priorizados.

La separación entre capas de presentación, lógica de negocio, persistencia e infraestructura permite reducir acoplamiento, facilitar mantenibilidad y favorecer la evolución progresiva del proyecto.

Asimismo, la modularización de componentes facilita pruebas, reutilización de funcionalidades y escalabilidad funcional de la plataforma.

---

## 10.5 Consideraciones arquitectónicas

La definición de componentes del sistema fue realizada considerando principios de:

- Modularidad y separación de responsabilidades.
- Desacoplamiento entre capas arquitectónicas.
- Reutilización de componentes.
- Escalabilidad funcional y técnica.
- Facilidad de mantenimiento y evolución.
- Integración con servicios externos.
- Consistencia estructural del sistema.

Estas decisiones permiten mantener una arquitectura organizada y preparada para futuras ampliaciones funcionales y tecnológicas.

---

<p align="center">
  Diagramas de componentes · Clean Architecture · Modularidad · Backend · Frontend
</p>

---

# 11. Diagramas de paquetes

## 11.1 Definición e impacto en el diseño

Un diagrama de paquetes representa la organización lógica del sistema mediante agrupaciones estructuradas de módulos, componentes o elementos relacionados según sus responsabilidades y dependencias.

Este tipo de diagramas permite visualizar cómo se distribuyen las distintas áreas funcionales y técnicas dentro del proyecto, facilitando la comprensión de la arquitectura interna, la modularización del sistema y las relaciones entre paquetes.

En el contexto de Inmuebles El Guarzo, los diagramas de paquetes fueron utilizados para representar la organización estructural tanto del backend como del frontend, permitiendo identificar agrupaciones funcionales, separación de responsabilidades y dependencias entre módulos del sistema.

Además, estos diagramas ayudan a mantener consistencia arquitectónica, facilitar mantenimiento y apoyar la evolución progresiva de la solución.

---

## 11.2 Diagrama de paquetes del backend

### 11.2.1 Descripción general

El diagrama de paquetes del backend representa la organización lógica de módulos, capas y dominios funcionales que conforman la arquitectura interna del sistema.

La estructura propuesta sigue principios de Clean Architecture y modularización basada en bounded contexts, buscando mantener independencia entre componentes, separación clara de responsabilidades y reducción de acoplamiento entre capas.

---

### 11.2.2 Paquetes identificados

| Paquete              | Paquete padre                           | Descripción                                    |
| -------------------- | --------------------------------------- | ---------------------------------------------- |
| [Nombre del paquete] | [Nombre del paquete contenedor o raíz.] | [Descripción funcional y técnica del paquete.] |
| [Nombre del paquete] | [Nombre del paquete padre.]             | [Descripción.]                                 |
| [Nombre del paquete] | [Nombre del paquete padre.]             | [Descripción.]                                 |
| [Nombre del paquete] | [Nombre del paquete padre.]             | [Descripción.]                                 |

> Agregar una fila por cada paquete adicional del backend.

---

### 11.2.3 Diagrama de paquetes del backend

<p align="center">
  <img
    src="./assets/diagrams/backend-packages.png"
    width="1100"
    alt="Diagrama de paquetes del backend"
  />
</p>

---

## 11.3 Diagrama de paquetes del frontend

### 11.3.1 Descripción general

El diagrama de paquetes del frontend representa la organización lógica de módulos visuales, páginas, componentes reutilizables y servicios de comunicación que conforman la interfaz de usuario de la plataforma.

La arquitectura propuesta busca mantener separación entre presentación, navegación, consumo de APIs y componentes compartidos, favoreciendo mantenibilidad, reutilización y escalabilidad visual del sistema.

---

| Paquete                   | Paquete padre              | Descripción                                                                                                                                          |
| ------------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **src**                   | Raíz del proyecto frontend | Paquete principal que contiene toda la estructura fuente de la aplicación frontend desarrollada en React y TypeScript.                               |
| **main**                  | src                        | Punto de entrada principal de la aplicación frontend encargado de inicializar React, montar la aplicación y configurar el entorno base de ejecución. |
| **app**                   | src                        | Paquete encargado de configurar la aplicación principal, proveedores globales, contextos y composición general del frontend.                         |
| **routers**               | src                        | Gestiona las rutas de navegación de la aplicación utilizando React Router DOM, definiendo accesos públicos y privados.                               |
| **pages**                 | src                        | Contiene las páginas principales del sistema, agrupando las vistas funcionales utilizadas por los distintos actores del sistema.                     |
| **admin**                 | pages                      | Subpaquete que agrupa las páginas y funcionalidades correspondientes al panel administrativo del sistema inmobiliario.                               |
| **auth**                  | admin                      | Contiene las vistas y componentes relacionados con autenticación, inicio de sesión y validación de acceso administrativo.                            |
| **components**            | src                        | Contiene componentes reutilizables de interfaz gráfica utilizados en diferentes páginas y módulos del frontend.                                      |
| **hooks**                 | src                        | Contiene hooks personalizados de React utilizados para encapsular lógica reutilizable y manejo de estado compartido.                                 |
| **api**                   | src                        | Gestiona la comunicación entre el frontend y el backend mediante servicios HTTP y configuración de clientes API.                                     |
| **lib**                   | src                        | Contiene librerías internas, utilidades y configuraciones auxiliares reutilizadas en toda la aplicación frontend.                                    |
| **types**                 | src                        | Define interfaces, tipos y contratos TypeScript utilizados para tipado fuerte y validación estructural de datos.                                     |
| **react-router-dom**      | Dependencia externa        | Librería utilizada para gestionar navegación, rutas dinámicas y protección de vistas dentro de la aplicación React.                                  |
| **@supabase/supabase-js** | Dependencia externa        | SDK oficial utilizado para integrar autenticación y comunicación con Supabase desde el frontend.                                                     |
| **axios**                 | Dependencia externa        | Librería HTTP utilizada para realizar solicitudes REST hacia el backend y consumir servicios externos.                                               |

---

### 11.3.3 Diagrama de paquetes del frontend

<p align="center">
  <img
    src="./assets/diagrams/frontend-packages.png"
    width="1100"
    alt="Diagrama de paquetes del frontend"
  />
</p>

---

## 11.4 Relación entre paquetes del sistema

Los paquetes definidos dentro del backend y frontend permiten organizar el sistema en agrupaciones lógicas coherentes, facilitando la separación de responsabilidades y reduciendo dependencias innecesarias entre módulos.

La organización estructural propuesta favorece:

- Modularidad y desacoplamiento.
- Escalabilidad funcional.
- Facilidad de mantenimiento.
- Reutilización de componentes.
- Evolución progresiva de la arquitectura.
- Claridad organizacional del proyecto.

Asimismo, esta estructura facilita la incorporación de nuevas funcionalidades y la administración de dependencias técnicas dentro del sistema.

---

## 11.5 Consideraciones arquitectónicas

La definición de paquetes fue realizada siguiendo principios de arquitectura empresarial y buenas prácticas de organización de software, buscando mantener consistencia estructural entre backend y frontend.

Estas decisiones permiten construir una solución organizada, mantenible y preparada para futuras ampliaciones funcionales y tecnológicas.

---

<p align="center">
  Diagramas de paquetes · Modularidad · Clean Architecture · Organización estructural · Arquitectura empresarial
</p>
