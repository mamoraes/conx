from flask import request, flash
from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField, TextAreaField, FieldList, FormField, SelectField, FileField, IntegerField, validators
from wtforms.ext.sqlalchemy.fields import QuerySelectField
from wtforms.validators import ValidationError, DataRequired, Length, InputRequired
from flask_babel import _, lazy_gettext as _l
from app.models import User, Conexao
from werkzeug.utils import secure_filename

class EditProfileForm(FlaskForm):
    username = StringField(_l('Username'), validators=[DataRequired()])
    about_me = TextAreaField(_l('About me'),
                             validators=[Length(min=0, max=140)])
    submit = SubmitField(_l('Submit'))

    def __init__(self, original_username, *args, **kwargs):
        super(EditProfileForm, self).__init__(*args, **kwargs)
        self.original_username = original_username

    def validate_username(self, username):
        if username.data != self.original_username:
            user = User.query.filter_by(username=self.username.data).first()
            if user is not None:
                raise ValidationError(_('Please use a different username.'))

class EditConexaoForm(FlaskForm):
    nome = StringField('Nome', validators=[DataRequired()])
    string = TextAreaField('Dados conexão', validators=[DataRequired()])
    usuario = StringField('Usuário')
    senha = StringField('Senha')
    habilitada = SelectField('Habilitada?', validators=[InputRequired()], description="Disponível",choices=['S','N'])
    StringField('Em produção?', validators=[DataRequired()])

    submit = SubmitField(_l('OK'))

    def __init__(self, id: int, *args, **kwargs):
        super(EditConexaoForm, self).__init__(*args, **kwargs)
        self.id = id

class EditConsultaForm(FlaskForm):
    nome = StringField('Nome',validators=[DataRequired()],description='Nome da consulta', render_kw={"placeholder": 'Nome da consulta'} )
    descricao = StringField('Descrição',validators=[DataRequired()],description='Descrição da consulta' )
    fonte = StringField('Fonte', validators=[DataRequired()], description='Nome dado a origem dos dados')
    cmd_sql = TextAreaField('Comando SQL', validators=[DataRequired()], description='Comando aplicado ao Banco de dados')
    habilitada = SelectField('Habilitada?', validators=[InputRequired()], description="Disponível", choices=['S', 'N'])
    StringField('Em produção', validators=[DataRequired()])

    submit = SubmitField(_l('OK'))

    def __init__(self, id: int, *args, **kwargs):
        super(EditConsultaForm, self).__init__(*args, **kwargs)
        self.id = id


class EditTrilhaForm(FlaskForm):
    nome = StringField('Nome',validators=[DataRequired()],description='Nome da trilha', render_kw={"placeholder": 'Nome da trilha'} )
    descricao = StringField('Descrição',validators=[DataRequired()],description='Descrição da trilha' )

    submit = SubmitField(_l('OK'))

    def __init__(self, id: int, *args, **kwargs):
        super(EditTrilhaForm, self).__init__(*args, **kwargs)
        self.id = id

class EditPesquisaForm(FlaskForm):
    nome = StringField('Nome', validators=[DataRequired()])
    descricao = StringField('Descrição',validators=[DataRequired()], description='Descrição da pesquisa' )
    itens_lista = TextAreaField('PFs e PJs a serem pesquisados', validators=[DataRequired()])
    submit = SubmitField(_l('OK'))

    def __init__(self, id: int, *args, **kwargs):
        super(EditPesquisaForm, self).__init__(*args, **kwargs)
        self.id = id
