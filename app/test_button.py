from flask import Flask, render_template_string
from flask_wtf import Form
from wtforms import StringField
from wtforms.widgets import html_params, HTMLString

app = Flask(__name__)
app.secret_key = 'SHH!'


class ButtonWidget(object):
    """
    Renders a multi-line text area.
    `rows` and `cols` ought to be passed as keyword args when rendering.
    """
    input_type = 'submit'

    html_params = staticmethod(html_params)

    def __call__(self, field, **kwargs):
        kwargs.setdefault('id', field.id)
        kwargs.setdefault('type', self.input_type)
        if 'value' not in kwargs:
            kwargs['value'] = field._value()

        return HTMLString('<button {params}>{label}</button>'.format(
            params=self.html_params(name=field.name, **kwargs),
            label=field.label.text)
        )


class ButtonField(StringField):
    widget = ButtonWidget()


class TestForm(Form):
    choice_a = ButtonField('example')
    choice_b = ButtonField('other')


@app.route('/', methods=['post', 'get'])
def home():
    form = TestForm()
    if form.is_submitted():
        if form.choice_a.data:
            return form.choice_a.data
        else:
            return form.choice_b.data

    form.choice_a.data = 'First Choice'
    form.choice_b.data = 'Second Choice'

    return render_template_string('''
        <form action="" method="post">
            {{ form.hidden_tag() }}
            {{ form.choice_a() }}
            {{ form.choice_b }}
        </form>
    ''', form=form)


if __name__ == '__main__':
    app.run(debug=True)