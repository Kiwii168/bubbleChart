/* =====================================================
   VARIABLES
===================================================== */

let data = [];

let config = {};

let timeValues = [];

let current = 0;

let timer = null;


/*
Entidad seleccionada mediante
click en la burbuja.
*/

let selected = null;


/*
Entidades visibles mediante
los checkboxes.
*/

let visibleEntities =
    new Set();


let colors = {};



/* =====================================================
   ELEMENTOS HTML
===================================================== */

const chartElement =
    document.getElementById(
        "chart"
    );


const timeline =
    document.getElementById(
        "timeline"
    );


const yearsContainer =
    document.getElementById(
        "years"
    );


const currentTime =
    document.getElementById(
        "currentTime"
    );


const playButton =
    document.getElementById(
        "play"
    );


const pauseButton =
    document.getElementById(
        "pause"
    );


const entityList =
    document.getElementById(
        "entityList"
    );


const entitySearch =
    document.getElementById(
        "entitySearch"
    );


const selectAllButton =
    document.getElementById(
        "selectAll"
    );


const deselectAllButton =
    document.getElementById(
        "deselectAll"
    );


const entityCount =
    document.getElementById(
        "entityCount"
    );


const entityDropdownButton =
    document.getElementById(
        "entityDropdownButton"
    );



/* =====================================================
   ECHARTS
===================================================== */

const chart =
    echarts.init(
        chartElement
    );



/* =====================================================
   CONVERTIR A NÚMERO
===================================================== */

function num(value) {


    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return 0;

    }


    if (
        typeof value ===
        "number"
    ) {

        return Number.isFinite(value)
            ? value
            : 0;

    }


    const text =
        String(value)

            .trim()

            .replace(
                /\s/g,
                ""
            )

            .replace(
                /,/g,
                ""
            );


    const result =
        Number(text);


    return Number.isFinite(result)
        ? result
        : 0;

}



/* =====================================================
   COLORES
===================================================== */

const palette = [

    "#5470C6",

    "#91CC75",

    "#FAC858",

    "#EE6666",

    "#73C0DE",

    "#3BA272",

    "#FC8452",

    "#9A60B4",

    "#EA7CCC",

    "#60C0DD",

    "#D7504B",

    "#C6E579",

    "#F4E001",

    "#F0805A",

    "#26C0C0"

];



function getColor(value) {


    const key =
        String(
            value ?? ""
        );


    if (!colors[key]) {


        const index =

            Object.keys(
                colors
            ).length

            %

            palette.length;


        colors[key] =
            palette[index];

    }


    return colors[key];

}



/* =====================================================
   NORMALIZAR TIEMPO
===================================================== */

function normalizeTime(value) {


    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return null;

    }



    /* =========================
       AÑO
    ========================= */

    if (
        config.timeType ===
        "year"
    ) {


        const year =
            Number(value);


        return Number.isFinite(year)
            ? year
            : null;

    }



    /* =========================
       SERIAL EXCEL
    ========================= */

    if (
        typeof value ===
        "number"
    ) {


        const excelEpoch =
            Date.UTC(
                1899,
                11,
                30
            );


        return (

            excelEpoch

            +

            value *
            86400000

        );

    }



    const text =
        String(value).trim();



    /* =========================
       YYYY-MM-DD
    ========================= */

    let match =
        text.match(

            /^(\d{4})-(\d{1,2})-(\d{1,2})/

        );


    if (match) {


        return Date.UTC(

            Number(
                match[1]
            ),

            Number(
                match[2]
            ) - 1,

            Number(
                match[3]
            )

        );

    }



    /* =========================
       DD/MM/YYYY
    ========================= */

    match =
        text.match(

            /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/

        );


    if (match) {


        return Date.UTC(

            Number(
                match[3]
            ),

            Number(
                match[2]
            ) - 1,

            Number(
                match[1]
            )

        );

    }



    const parsed =
        Date.parse(text);


    return Number.isNaN(parsed)
        ? null
        : parsed;

}



/* =====================================================
   FORMATEAR TIEMPO
===================================================== */

function formatTime(value) {


    if (
        config.timeType ===
        "year"
    ) {

        return String(value);

    }


    const date =
        new Date(value);


    return date.toLocaleDateString(

        "es-MX",

        {

            year:
                "numeric",

            month:
                "short",

            day:
                "numeric",

            timeZone:
                "UTC"

        }

    );

}



/* =====================================================
   CARGAR JSON
===================================================== */

async function load() {


    try {


        const cache =
            "?v=" +
            Date.now();



        const [

            dataResponse,

            configResponse

        ] =

        await Promise.all([


            fetch(

                "data.json" +
                cache

            ),


            fetch(

                "config.json" +
                cache

            )


        ]);



        if (
            !dataResponse.ok
        ) {

            throw new Error(

                "No se pudo cargar data.json"

            );

        }



        if (
            !configResponse.ok
        ) {

            throw new Error(

                "No se pudo cargar config.json"

            );

        }



        data =
            await dataResponse.json();


        config =
            await configResponse.json();



        initialize();


    }
    catch (error) {


        console.error(
            error
        );


        chartElement.innerHTML = `

            <div
                class="alert alert-danger m-4"
            >

                <strong>
                    Error cargando la gráfica
                </strong>

                <br>

                ${error.message}

            </div>

        `;

    }

}



/* =====================================================
   INICIALIZAR
===================================================== */

function initialize() {


    if (
        !Array.isArray(data) ||
        !data.length
    ) {


        throw new Error(

            "data.json no contiene información."

        );

    }



    if (
        !config.entity ||
        !config.time ||
        !config.x ||
        !config.y ||
        !config.size
    ) {


        throw new Error(

            "config.json está incompleto."

        );

    }



    /* =========================
       TIEMPOS
    ========================= */

    const normalized =

        data

        .map(

            row =>

                normalizeTime(

                    row[
                        config.time
                    ]

                )

        )

        .filter(

            value =>

                value !== null

        );



    timeValues = [

        ...new Set(
            normalized
        )

    ];


    timeValues.sort(

        (a,b) =>
            a-b

    );



    if (
        !timeValues.length
    ) {


        throw new Error(

            "No se encontraron años o fechas válidas."

        );

    }



    current =
        0;


    timeline.min =
        0;


    timeline.max =

        Math.max(

            timeValues.length - 1,

            0

        );


    timeline.value =
        0;



    createEntityList();

    createTimeline();

    draw();

}



/* =====================================================
   CREAR LISTADO DE ENTIDADES
===================================================== */

function createEntityList() {


    entityList.innerHTML =
        "";


    visibleEntities.clear();



    const entities = [

        ...new Set(

            data

            .map(

                row =>

                    String(

                        row[
                            config.entity
                        ]

                        ?? ""

                    ).trim()

            )

            .filter(

                entity =>

                    entity !== ""

            )

        )

    ];



    entities.sort(

        (a,b) =>

            a.localeCompare(

                b,

                "es",

                {
                    sensitivity:
                        "base"
                }

            )

    );



    entities.forEach(

        (
            entity,
            index
        ) => {


            /*
            Inicialmente todas
            son visibles.
            */

            visibleEntities.add(
                entity
            );



            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "entity-item";


            item.dataset.entity =
                entity;



            const checkbox =
                document.createElement(
                    "input"
                );


            checkbox.type =
                "checkbox";


            checkbox.className =
                "form-check-input m-0 entity-checkbox";


            checkbox.checked =
                true;


            checkbox.id =
                "entity-" +
                index;


            checkbox.value =
                entity;



            const label =
                document.createElement(
                    "label"
                );


            label.htmlFor =
                checkbox.id;


            label.textContent =
                entity;



            checkbox.addEventListener(

                "change",

                function () {


                    if (
                        this.checked
                    ) {


                        visibleEntities.add(
                            entity
                        );


                    }
                    else {


                        visibleEntities.delete(
                            entity
                        );



                        /*
                        Si ocultamos la entidad
                        actualmente seleccionada,
                        quitamos su selección.
                        */

                        if (
                            selected ===
                            entity
                        ) {

                            selected =
                                null;

                        }

                    }



                    updateEntityCount();

                    draw();

                }

            );



            item.appendChild(
                checkbox
            );


            item.appendChild(
                label
            );


            entityList.appendChild(
                item
            );


        }

    );



    updateEntityCount();

}



/* =====================================================
   CONTADOR ENTIDADES
===================================================== */

function updateEntityCount() {


    const total =

        document.querySelectorAll(

            ".entity-checkbox"

        ).length;



    const selectedCount =
        visibleEntities.size;



    entityCount.textContent =

        selectedCount

        +

        " de "

        +

        total

        +

        " entidades seleccionadas";



    /*
    También mostramos el número
    en el botón.
    */

    entityDropdownButton.textContent =

        "Entidades (" +

        selectedCount +

        "/" +

        total +

        ")";

}



/* =====================================================
   BUSCAR ENTIDADES
===================================================== */

entitySearch.addEventListener(

    "input",

    function () {


        const search =

            this.value

            .trim()

            .toLowerCase();



        document

        .querySelectorAll(
            ".entity-item"
        )

        .forEach(

            item => {


                const entity =

                    item.dataset.entity

                    .toLowerCase();



                item.style.display =

                    entity.includes(
                        search
                    )

                    ?

                    "flex"

                    :

                    "none";


            }

        );

    }

);



/* =====================================================
   SELECCIONAR TODAS
===================================================== */

selectAllButton.addEventListener(

    "click",

    function () {


        document

        .querySelectorAll(
            ".entity-checkbox"
        )

        .forEach(

            checkbox => {


                checkbox.checked =
                    true;


                visibleEntities.add(
                    checkbox.value
                );


            }

        );


        updateEntityCount();

        draw();

    }

);



/* =====================================================
   DESELECCIONAR TODAS
===================================================== */

deselectAllButton.addEventListener(

    "click",

    function () {


        document

        .querySelectorAll(
            ".entity-checkbox"
        )

        .forEach(

            checkbox => {


                checkbox.checked =
                    false;

            }

        );


        visibleEntities.clear();


        selected =
            null;


        updateEntityCount();

        draw();

    }

);



/* =====================================================
   CREAR TIMELINE
===================================================== */

function createTimeline() {


    yearsContainer.innerHTML =
        "";



    timeValues.forEach(

        (
            value,
            index
        ) => {


            const span =
                document.createElement(
                    "span"
                );


            span.textContent =
                formatTime(
                    value
                );



            let percentage =
                50;



            if (
                timeValues.length > 1
            ) {


                percentage =

                    index

                    /

                    (
                        timeValues.length -
                        1
                    )

                    *

                    100;

            }



            span.style.left =
                percentage +
                "%";



            span.addEventListener(

                "click",

                function () {


                    current =
                        index;


                    timeline.value =
                        index;


                    draw();

                }

            );



            yearsContainer.appendChild(
                span
            );


        }

    );

}



/* =====================================================
   DATOS VISIBLES DE TODOS LOS PERIODOS

   Los usamos para mantener los ejes estables
   durante toda la animación.
===================================================== */

function getAllVisibleData() {


    return data.filter(

        row => {


            const entity =

                String(

                    row[
                        config.entity
                    ]

                    ?? ""

                ).trim();



            return visibleEntities.has(
                entity
            );

        }

    );

}



/* =====================================================
   CALCULAR LÍMITES DE LOS EJES
===================================================== */

function calculateAxisLimits() {


    const rows =
        getAllVisibleData();



    if (
        !rows.length
    ) {


        return {

            xMin: 0,

            xMax: 1,

            yMin: 0,

            yMax: 1

        };

    }



    const xValues =

        rows

        .map(

            row =>

                num(

                    row[
                        config.x
                    ]

                )

        )

        .filter(
            Number.isFinite
        );



    const yValues =

        rows

        .map(

            row =>

                num(

                    row[
                        config.y
                    ]

                )

        )

        .filter(
            Number.isFinite
        );



    let xMin =
        Math.min(
            ...xValues
        );


    let xMax =
        Math.max(
            ...xValues
        );


    let yMin =
        Math.min(
            ...yValues
        );


    let yMax =
        Math.max(
            ...yValues
        );



    let xRange =
        xMax -
        xMin;


    let yRange =
        yMax -
        yMin;



    if (
        xRange === 0
    ) {


        xRange =

            Math.abs(
                xMax
            )

            ||

            1;

    }



    if (
        yRange === 0
    ) {


        yRange =

            Math.abs(
                yMax
            )

            ||

            1;

    }



    /*
    Margen adicional para que
    las burbujas no queden cortadas.
    */

    const xPadding =
        xRange *
        0.10;


    const yPadding =
        yRange *
        0.15;



    return {


        xMin:

            xMin -
            xPadding,


        xMax:

            xMax +
            xPadding,


        yMin:

            yMin -
            yPadding,


        yMax:

            yMax +
            yPadding


    };

}



/* =====================================================
   TAMAÑO MÁXIMO GLOBAL
===================================================== */

function getMaxBubbleSize() {


    const rows =
        getAllVisibleData();



    if (
        !rows.length
    ) {

        return 1;

    }



    const values =

        rows

        .map(

            row =>

                Math.abs(

                    num(

                        row[
                            config.size
                        ]

                    )

                )

        )

        .filter(
            Number.isFinite
        );



    return Math.max(

        ...values,

        1

    );

}



/* =====================================================
   DIBUJAR
===================================================== */

function draw() {


    if (
        !timeValues.length
    ) {

        return;

    }



    const time =
        timeValues[
            current
        ];



    currentTime.textContent =
        formatTime(
            time
        );



    /* =========================
       FILTRAR AÑO/FECHA
       Y ENTIDADES VISIBLES
    ========================= */

    const rows =

        data.filter(

            row => {


                const entity =

                    String(

                        row[
                            config.entity
                        ]

                        ?? ""

                    ).trim();



                return (

                    normalizeTime(

                        row[
                            config.time
                        ]

                    )

                    ===

                    time


                    &&


                    visibleEntities.has(
                        entity
                    )

                );

            }

        );



    /* =========================
       TAMAÑO GLOBAL
    ========================= */

    const maxSize =
        getMaxBubbleSize();



    /* =========================
       SCATTER
    ========================= */

    const scatterData =

        rows.map(

            row => {


                const entity =

                    String(

                        row[
                            config.entity
                        ]

                        ?? ""

                    ).trim();



                const category =

                    config.color

                    ?

                    row[
                        config.color
                    ]

                    :

                    entity;



                return {


                    name:
                        entity,


                    value: [


                        num(

                            row[
                                config.x
                            ]

                        ),


                        num(

                            row[
                                config.y
                            ]

                        ),


                        Math.abs(

                            num(

                                row[
                                    config.size
                                ]

                            )

                        )


                    ],


                    raw:
                        row,


                    itemStyle: {


                        color:

                            getColor(
                                category
                            ),


                        opacity:

                            selected === null

                            ?

                            0.85

                            :

                            selected === entity

                            ?

                            1

                            :

                            0.15


                    }


                };


            }

        );



    /* =========================
       LÍMITES
    ========================= */

    const limits =
        calculateAxisLimits();



    /* =========================
       TRAYECTORIA
    ========================= */

    let trail =
        [];


    let trailColor =
        "#555555";



    if (
        selected !== null
        &&
        visibleEntities.has(
            selected
        )
    ) {


        const selectedRows =

            data

            .filter(

                row => {


                    const entity =

                        String(

                            row[
                                config.entity
                            ]

                            ?? ""

                        ).trim();



                    const rowTime =

                        normalizeTime(

                            row[
                                config.time
                            ]

                        );



                    return (

                        entity ===
                        selected

                        &&

                        rowTime !==
                        null

                        &&

                        rowTime <=
                        time

                    );

                }

            )


            .sort(

                (
                    a,
                    b
                ) =>


                    normalizeTime(

                        a[
                            config.time
                        ]

                    )

                    -

                    normalizeTime(

                        b[
                            config.time
                        ]

                    )

            );



        trail =

            selectedRows.map(

                row => [


                    num(

                        row[
                            config.x
                        ]

                    ),


                    num(

                        row[
                            config.y
                        ]

                    )


                ]

            );



        /*
        Usar el mismo color
        que la burbuja.
        */

        if (
            selectedRows.length
        ) {


            const lastRow =

                selectedRows[
                    selectedRows.length -
                    1
                ];



            const category =

                config.color

                ?

                lastRow[
                    config.color
                ]

                :

                selected;



            trailColor =
                getColor(
                    category
                );

        }

    }



    /* =========================
       PUNTO SELECCIONADO
    ========================= */

    const selectedPoint =

        scatterData.find(

            point =>

                point.name ===
                selected

        );



    /* =========================
       ECHARTS
    ========================= */

    chart.setOption(

        {


            animation:
                true,


            animationDuration:
                900,


            animationDurationUpdate:
                900,


            animationEasing:
                "cubicInOut",


            animationEasingUpdate:
                "cubicInOut",



            grid: {


                left:
                    80,


                right:
                    60,


                top:
                    80,


                bottom:
                    70,


                containLabel:
                    true


            },



            /* =========================
               TIEMPO GRANDE
            ========================= */

            title: {


                text:

                    formatTime(
                        time
                    ),


                left:
                    "center",


                top:
                    5,


                textStyle: {


                    fontSize:
                        55,


                    fontWeight:
                        "bold",


                    color:
                        "#dddddd"


                }


            },



            /* =========================
               TOOLTIP
            ========================= */

            tooltip: {


                trigger:
                    "item",


                formatter:

                    function (
                        params
                    ) {


                        if (

                            params.seriesType
                            !==
                            "scatter"

                        ) {

                            return "";

                        }



                        const row =
                            params.data.raw;



                        return `

                            <strong>

                                ${
                                    row[
                                        config.entity
                                    ]
                                }

                            </strong>

                            <br>

                            ${config.time}:

                            ${
                                formatTime(

                                    normalizeTime(

                                        row[
                                            config.time
                                        ]

                                    )

                                )
                            }

                            <br>

                            ${config.x}:

                            ${
                                row[
                                    config.x
                                ]
                            }

                            <br>

                            ${config.y}:

                            ${
                                row[
                                    config.y
                                ]
                            }

                            <br>

                            ${config.size}:

                            ${
                                row[
                                    config.size
                                ]
                            }

                        `;

                    }


            },



            /* =========================
               EJE X
            ========================= */

            xAxis: {


                type:
                    "value",


                name:
                    config.x,


                nameLocation:
                    "middle",


                nameGap:
                    40,


                scale:
                    true,


                min:
                    limits.xMin,


                max:
                    limits.xMax,


                splitLine: {

                    show:
                        true

                }


            },



            /* =========================
               EJE Y
            ========================= */

            yAxis: {


                type:
                    "value",


                name:
                    config.y,


                nameLocation:
                    "middle",


                nameGap:
                    55,


                scale:
                    true,


                min:
                    limits.yMin,


                max:
                    limits.yMax,


                splitLine: {

                    show:
                        true

                }


            },



            /* =========================
               SERIES
            ========================= */

            series: [


                /* TRAYECTORIA */

                {


                    id:
                        "trail",


                    type:
                        "line",


                    data:
                        trail,


                    showSymbol:
                        true,


                    symbol:
                        "circle",


                    symbolSize:
                        6,


                    silent:
                        true,


                    lineStyle: {


                        width:
                            3,


                        color:
                            trailColor


                    },


                    itemStyle: {


                        color:
                            trailColor


                    },


                    z:
                        1


                },



                /* BURBUJAS */

                {


                    id:
                        "bubbles",


                    type:
                        "scatter",


                    data:
                        scatterData,


                    symbol:
                        "circle",



                    symbolSize:

                        function (
                            value
                        ) {


                            const size =

                                Math.abs(
                                    value[2]
                                );



                            if (
                                !size
                            ) {

                                return 10;

                            }



                            return (

                                10

                                +

                                Math.sqrt(

                                    size
                                    /
                                    maxSize

                                )

                                *

                                55

                            );

                        },



                    emphasis: {


                        scale:
                            1.15,


                        itemStyle: {


                            opacity:
                                1


                        }


                    },



                    /* =================
                       LÍNEAS PUNTEADAS
                    ================= */

                    markLine:


                        selectedPoint


                        ?


                        {


                            silent:
                                true,


                            symbol:
                                "none",


                            lineStyle: {


                                type:
                                    "dashed",


                                width:
                                    2,


                                color:
                                    "#555555"


                            },


                            label: {


                                show:
                                    true,


                                fontSize:
                                    14,


                                color:
                                    "#333333",


                                backgroundColor:
                                    "#ffffff",


                                padding: [
                                    3,
                                    5
                                ]


                            },


                            data: [


                                {

                                    xAxis:

                                        selectedPoint
                                            .value[0]

                                },


                                {

                                    yAxis:

                                        selectedPoint
                                            .value[1]

                                }


                            ]


                        }


                        :


                        undefined,


                    z:
                        2


                }


            ]


        },

        true

    );

}



/* =====================================================
   TIMELINE
===================================================== */

timeline.addEventListener(

    "input",

    function () {


        current =
            Number(
                this.value
            );


        draw();

    }

);



/* =====================================================
   PLAY
===================================================== */

playButton.addEventListener(

    "click",

    function () {


        if (
            timer
        ) {

            return;

        }



        if (

            current >=
            timeValues.length - 1

        ) {


            current =
                0;


            timeline.value =
                0;


            draw();

        }



        timer =

            setInterval(

                function () {


                    current++;



                    if (

                        current >=
                        timeValues.length

                    ) {


                        current =

                            timeValues.length -
                            1;



                        timeline.value =
                            current;



                        draw();



                        clearInterval(
                            timer
                        );


                        timer =
                            null;


                        return;

                    }



                    timeline.value =
                        current;


                    draw();


                },

                1500

            );

    }

);



/* =====================================================
   PAUSA
===================================================== */

pauseButton.addEventListener(

    "click",

    function () {


        clearInterval(
            timer
        );


        timer =
            null;

    }

);



/* =====================================================
   CLICK SOBRE BURBUJA

   Esto NO oculta entidades.

   Solo selecciona una para:
   - trayectoria
   - líneas punteadas
   - opacidad
===================================================== */

chart.on(

    "click",

    function (
        params
    ) {


        if (

            params.seriesType !==
            "scatter"

        ) {

            return;

        }



        const entity =
            params.data.name;



        if (
            selected ===
            entity
        ) {


            selected =
                null;


        }
        else {


            selected =
                entity;

        }



        draw();

    }

);



/* =====================================================
   CLICK EN ESPACIO VACÍO
===================================================== */

chart.getZr().on(

    "click",

    function (
        event
    ) {


        if (
            !event.target
        ) {


            selected =
                null;


            draw();

        }

    }

);



/* =====================================================
   RESPONSIVE
===================================================== */

window.addEventListener(

    "resize",

    function () {


        chart.resize();

    }

);



/* =====================================================
   INICIAR
===================================================== */

load();