from flask import Flask, render_template, request, jsonify
import networkx as nx

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/shortest-path', methods=['POST'])
def shortest_path():
    try:
        # Obtener datos del cliente
        data = request.json
        edges = data.get('edges', [])
        start = data.get('start', '').strip()
        end = data.get('end', '').strip()

        if not edges or not start or not end:
            return jsonify({'error': 'Datos incompletos enviados'}), 400

        # Crear el grafo dirigido
        G = nx.DiGraph()
        for edge in edges:
            source = edge.get('source')
            target = edge.get('target')
            weight = edge.get('weight')

            if not source or not target or weight is None:
                return jsonify({'error': 'Datos inválidos en las conexiones'}), 400

            G.add_edge(source, target, weight=weight)

        try:
            # Calcular la ruta más corta usando Dijkstra
            path = nx.dijkstra_path(G, source=start, target=end)
            distance = nx.dijkstra_path_length(G, source=start, target=end)
            return jsonify({'path': path, 'distance': distance})
        except nx.NetworkXNoPath:
            return jsonify({'path': [], 'distance': float('inf')})  # No hay ruta
    except Exception as e:
        print(f"Error en el servidor: {e}")
        return jsonify({'error': 'Error interno en el servidor'}), 500

if __name__ == '__main__':
    app.run(debug=True)
