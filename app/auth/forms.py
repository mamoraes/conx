from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, BooleanField, SubmitField
from wtforms.validators import ValidationError, DataRequired, Email, EqualTo
from flask_babel import _, lazy_gettext as _l
from app.models import User


class LoginForm(FlaskForm):
    username = StringField(_l('Usuário'), validators=[DataRequired()])
    password = PasswordField(_l('Senha'), validators=[DataRequired()])
    remember_me = BooleanField(_l('Lembrar de Mim'))
    submit = SubmitField(_l('Obter Acesso'))


class RegistrationForm(FlaskForm):
    username = StringField(_l('Usuário'), validators=[DataRequired()])
    email = StringField(_l('Email'), validators=[DataRequired(), Email()])
    password = PasswordField(_l('Senha'), validators=[DataRequired()])
    password2 = PasswordField(
        _l('Repita a Senha'), validators=[DataRequired(),
                                           EqualTo('password')])
    submit = SubmitField(_l('Registrar'))

    def validate_username(self, username):
        user = User.query.filter_by(username=username.data).first()
        if user is not None:
            raise ValidationError(_('Favor utilizar outro nome de usuário.'))

    def validate_email(self, email):
        user = User.query.filter_by(email=email.data).first()
        if user is not None:
            raise ValidationError(_('Favor utilizar outro endereço de email.'))


class ResetPasswordRequestForm(FlaskForm):
    email = StringField(_l('Email'), validators=[DataRequired(), Email()])
    submit = SubmitField(_l('Redefinir Senha'))


class ResetPasswordForm(FlaskForm):
    password = PasswordField(_l('Senha'), validators=[DataRequired()])
    password2 = PasswordField(
        _l('Repita a Senha'), validators=[DataRequired(),
                                           EqualTo('password')])
    submit = SubmitField(_l('Redefinir Senha'))
