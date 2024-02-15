from flask import Flask, request, jsonify, send_from_directory
import uuid

app = Flask(__name__)

data_store = {}

@app.route('/createChartSession', methods=['POST'])
def create_chart_session():
    textual_data_bytes = request.data or request.form.get('data')

    if not textual_data_bytes:
        return jsonify({"error": "No data provided"})
    else:
        textual_data = textual_data_bytes.decode('utf-8')

    unique_id = str(uuid.uuid4())

    data_store[unique_id] = textual_data

    return jsonify({"id": unique_id})


@app.route('/getChartData', methods=['GET'])
def get_chart_data():
    unique_id = request.args.get('id')

    if unique_id in data_store:
        return jsonify({"data": data_store[unique_id]})
    else:
        return jsonify({"data": "No data found for the given id"})
    
@app.route('/')
def serve():
    path = 'client/dist'
    return send_from_directory(path, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('client/dist', path)


if __name__ == '__main__':
    app.run(debug=True)
