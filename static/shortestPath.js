document.addEventListener('DOMContentLoaded', function () {
    const cy = window.cy;

    async function calculateShortestPath() {
        const startNode = prompt("Ingrese el nodo inicial para calcular la ruta más corta (letra):");
        const endNode = prompt("Ingrese el nodo final para calcular la ruta más corta (letra):");

        // Validar si se ingresaron ambos nodos
        if (!startNode || !endNode) {
            alert("Debe ingresar ambos nodos para calcular la ruta.");
            return;
        }

        // Obtener las conexiones del grafo
        const edges = cy.edges().map(edge => ({
            source: edge.data('source'),
            target: edge.data('target'),
            weight: edge.data('weight')
        }));

        // Validar si los nodos ingresados existen en el grafo
        if (!cy.getElementById(startNode).length || !cy.getElementById(endNode).length) {
            alert("Uno o ambos nodos no existen en el grafo.");
            return;
        }

        // Enviar los datos al servidor para calcular la ruta más corta
        const response = await fetch('/shortest-path', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ start: startNode, end: endNode, edges })
        });

        const data = await response.json();

        // Manejar el resultado de la ruta
        if (data.path.length === 0) {
            alert("No existe una ruta entre los nodos seleccionados.");
            return;
        }

        alert(`Distancia: ${data.distance}\nCamino: ${data.path.join(' → ')}`);

        // Resaltar la ruta más corta en el grafo
        cy.elements().removeClass('highlighted');
        for (let i = 0; i < data.path.length - 1; i++) {
            const source = data.path[i];
            const target = data.path[i + 1];
            cy.edges()
                .filter(edge => edge.data('source') === source && edge.data('target') === target)
                .addClass('highlighted');
        }
    }

    window.calculateShortestPath = calculateShortestPath;
});
