# -*- coding: utf-8 -*-
# Generated by Django 1.10.2 on 2016-11-21 13:32
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('library', '0018_auto_20161107_1643'),
    ]

    operations = [
        migrations.AddField(
            model_name='sample',
            name='is_converted',
            field=models.BooleanField(default=False, verbose_name='Is converted?'),
        ),
    ]