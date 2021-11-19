from app import create_app, db, cli
from app.models import User

app = create_app()
cli.register(app)


@app.shell_context_processor
def make_shell_context():
    return {'db': db, 'User': User}
"""
if __name__ == '__main__':
    import webbrowser
    webbrowser.open('http://127.0.0.1:5000/rede', new=0, autoraise=True)
    #app.run(debug=True, use_reloader=True)
    app.run(host='0.0.0.0',debug=True, use_reloader=True)
"""