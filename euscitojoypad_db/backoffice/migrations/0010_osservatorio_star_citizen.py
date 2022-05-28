# Generated by Django 4.0.4 on 2022-05-28 12:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backoffice', '0009_episodio_note'),
    ]

    operations = [
        migrations.AlterField(
            model_name='associazioneepisodiovideogame',
            name='tipologia',
            field=models.CharField(choices=[('FREE', 'Chiacchiera libera'), ('RECE', 'Recensione'), ('CONS', 'Consiglio'), ('STAR', 'Osservatorio Start Citizen')], default='FREE', max_length=4, verbose_name='Tipologia della citazione'),
        ),
    ]