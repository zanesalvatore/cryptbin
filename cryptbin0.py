import contextlib
import sqlite3
import flask

DATABASE = 'cryptbin.db'
DEBUG = True

# development key - change before using
SECRET_KEY = 'xDGUFyWgughlAgT89l3IIepiZDke7HNOY59Az39iPjeWqBsFhSvPKXogMj6R87UyHQtokyU73dBBoQm54SfAJJOvo2zvqC6L0A1QEmkUHmNzpyxxpqG4w4o6A2jQHmRe'


app = flask.Flask(__name__)
app.config.from_object(__name__)


def connect_db():
    return sqlite3.connect(app.config['DATABASE'])


def init_db():
    with contextlib.closing(connect_db()) as db:
        with app.open_resource('schema.sql', mode='r') as f:
            db.cursor().executescript(f.read())
        db.commit()


# @app.before_request
# def before_request():
#     flask.g.db = connect_db()


def get_db():
    """
    :return: sqlite3.Connection
    """
    db = getattr(flask.g, 'db', None)
    if db is None:
        db = flask.g.db = connect_db()
    return db


@app.teardown_request
def teardown_request(exception):
    db = getattr(flask.g, 'db', None)
    if db is not None:
        db.close()


@app.route("/")
def index():
    return flask.render_template("create.html")


@app.route("/p", methods=['POST'])
def post_paste():
    """
    Accepts a JSON-formatted paste submission via POST and returns a link to the
    newly-created paste location.
    :return:
    """
    cur = get_db().cursor()
    form_data = flask.request.get_json()
    print(form_data)
    cur.execute('insert into pastes (paste) values (?)', 
                [form_data['paste-contents']])
    get_db().commit()
    paste_id = cur.lastrowid
    cur.close()
    return flask.jsonify(paste_id=paste_id,
                         paste_url=flask.url_for(
                             'get_paste', paste_id=paste_id))


@app.route("/p/<int:paste_id>")
def get_paste(paste_id=None):
    if paste_id is None:
        return flask.jsonify(error="Invalid paste ID"), 400

    cur = get_db().execute(
        'select paste from pastes where id = ?', [paste_id])

    paste = cur.fetchone()

    if paste is None:
        return flask.jsonify(error="Not found"), 404

    return flask.jsonify(paste_id=paste_id, paste=paste[0])


if __name__ == '__main__':
    app.run()
