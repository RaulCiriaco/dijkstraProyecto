document.addEventListener('DOMContentLoaded', function () {
    // Inicializar el grafo y hacerlo accesible globalmente
    window.cy = cytoscape({
        container: document.getElementById('cy'),
        elements: [],
        style: [
            {
                selector: 'node',
                style: {
                    'label': 'data(id)', // Mostrar el identificador como etiqueta
                    'color': '#fff',
                    'background-color': 'data(color)', // Color dinámico
                    'text-valign': 'center'
                }
            },
            {
                selector: '.highlighted', // Estilo para resaltar rutas
                style: {
                    'line-color': '#FF4136',
                    'target-arrow-color': '#FF4136',
                    'width': 5
                }
            },
            {
                selector: 'edge',
                style: {
                    'width': 3,
                    'line-color': '#2ECC40',
                    'target-arrow-color': '#2ECC40',
                    'target-arrow-shape': 'triangle',
                    'curve-style': 'bezier',
                    'label': 'data(weight)' // Mostrar el peso de las conexiones
                }
            }
        ],
        layout: {
            name: 'breadthfirst', // Disposición inicial vertical
            directed: true
        }
    });

    // Mapeo de colores para nodos según su origen
    let colorMap = {};
    const colors = ['#0074D9', '#FF4136', '#2ECC40', '#FF851B', '#B10DC9'];
    let colorIndex = 0;

    // Dibujar los nodos iniciales
    function drawNodes() {
        const nodesCount = parseInt(document.getElementById('nodes').value);
        cy.elements().remove(); // Limpiar el grafo actual

        // Generar identificadores de nodos como letras (A, B, C, ...)
        const nodes = [...Array(nodesCount).keys()].map(i => String.fromCharCode(65 + i)); 
        const elements = nodes.map(node => {
            if (!colorMap[node]) {
                colorMap[node] = colors[colorIndex % colors.length];
                colorIndex++;
            }
            return { data: { id: node, color: colorMap[node] } };
        });

        cy.add(elements);
        cy.layout({ name: 'breadthfirst', directed: true }).run();

        // Generar la tabla
        const tableBody = document.getElementById('connections-table').getElementsByTagName('tbody')[0];
        tableBody.innerHTML = ""; // Limpiar la tabla existente

        nodes.forEach(node => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td style="background-color: ${colorMap[node]}; color: #fff;">
                    <input type="text" value="${node}" readonly>
                </td>
                <td><input type="text" placeholder="Destino"></td>
                <td><input type="number" placeholder="Distancia"></td>
                <td>
                    <button type="button" onclick="addRow(this)">Agregar nuevo destino</button>
                    <button type="button" onclick="removeRow(this)">Eliminar</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Agregar un nuevo nodo origen
    function addNewNode() {
        const newNodeId = prompt("Ingrese el identificador del nuevo nodo origen:");
        if (newNodeId && !cy.getElementById(newNodeId).length) {
            colorMap[newNodeId] = colors[colorIndex % colors.length];
            colorIndex++;

            cy.add({ data: { id: newNodeId, color: colorMap[newNodeId] } });
            cy.layout({ name: 'breadthfirst', directed: true }).run();

            const tableBody = document.getElementById('connections-table').getElementsByTagName('tbody')[0];
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td style="background-color: ${colorMap[newNodeId]}; color: #fff;">
                    <input type="text" value="${newNodeId}" readonly>
                </td>
                <td><input type="text" placeholder="Destino"></td>
                <td><input type="number" placeholder="Distancia"></td>
                <td>
                    <button type="button" onclick="addRow(this)">Agregar nuevo destino</button>
                    <button type="button" onclick="removeRow(this)">Eliminar</button>
                </td>
            `;
            tableBody.appendChild(newRow);
        } else {
            alert("El nodo ya existe o no se ingresó un identificador válido.");
        }
    }

    // Agregar una fila adicional para destinos
    function addRow(button) {
        const row = button.parentNode.parentNode;
        const tableBody = row.parentNode;

        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td style="background-color: ${row.cells[0].style.backgroundColor}; color: #fff;">
                <input type="text" value="${row.cells[0].getElementsByTagName('input')[0].value}" readonly>
            </td>
            <td><input type="text" placeholder="Destino"></td>
            <td><input type="number" placeholder="Distancia"></td>
            <td>
                <button type="button" onclick="removeRow(this)">Eliminar</button>
            </td>
        `;
        tableBody.insertBefore(newRow, row.nextSibling);
    }

    // Eliminar una fila específica
    function removeRow(button) {
        const row = button.parentNode.parentNode;
        row.parentNode.removeChild(row);
    }

    // Agregar conexiones al grafo
    function addConnections() {
        const tableBody = document.getElementById('connections-table').getElementsByTagName('tbody')[0];
        const rows = tableBody.getElementsByTagName('tr');
        const edges = [];

        for (let row of rows) {
            const source = row.cells[0].getElementsByTagName('input')[0]?.value || null;
            const target = row.cells[1].getElementsByTagName('input')[0]?.value || null;
            const weight = parseFloat(row.cells[2].getElementsByTagName('input')[0]?.value || NaN);

            if (source && target && !isNaN(weight)) {
                if (!colorMap[target]) {
                    colorMap[target] = colorMap[source];
                }

                const existingEdge = cy.edges().filter(edge =>
                    edge.data('source') === source && edge.data('target') === target
                );

                if (existingEdge.length === 0) {
                    edges.push({ data: { source, target, weight } });

                    if (!cy.getElementById(target).length) {
                        cy.add({ data: { id: target, color: colorMap[target] } });
                    }
                }
            }
        }

        cy.add(edges);
        cy.layout({ name: 'breadthfirst', directed: true }).run();
    }

    // Eliminar nodos ausentes en la tabla
    function removeMissingNodes() {
        const tableBody = document.getElementById('connections-table').getElementsByTagName('tbody')[0];
        const rows = tableBody.getElementsByTagName('tr');
        const tableNodes = new Set();

        for (let row of rows) {
            const source = row.cells[0].getElementsByTagName('input')[0]?.value;
            if (source) {
                tableNodes.add(source);
            }
        }

        cy.nodes().forEach(node => {
            if (!tableNodes.has(node.id())) {
                cy.remove(node);
            }
        });

        cy.layout({ name: 'breadthfirst', directed: true }).run();
    }

    window.drawNodes = drawNodes;
    window.addNewNode = addNewNode;
    window.addRow = addRow;
    window.removeRow = removeRow;
    window.addConnections = addConnections;
    window.removeMissingNodes = removeMissingNodes;
});
