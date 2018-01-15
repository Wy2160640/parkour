# -*- coding: utf-8 -*-
# Generated by Django 1.11.4 on 2018-01-15 16:50
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    replaces = [('library_sample_shared', '0001_initial'), ('library_sample_shared', '0002_auto_20180115_1750')]

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='BarcodeCounter',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('last_id', models.PositiveSmallIntegerField(default=0)),
                ('year', models.PositiveSmallIntegerField(default=2018, unique=True)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='ConcentrationMethod',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, verbose_name='Name')),
            ],
            options={
                'verbose_name': 'Concentration Method',
                'verbose_name_plural': 'Concentration Methods',
            },
        ),
        migrations.CreateModel(
            name='IndexI5',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('index_id', models.CharField(max_length=15, unique=True, verbose_name='Index ID')),
                ('index', models.CharField(max_length=8, verbose_name='Index')),
            ],
            options={
                'verbose_name': 'Index I5',
                'verbose_name_plural': 'Indices I5',
            },
        ),
        migrations.CreateModel(
            name='IndexI7',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('index_id', models.CharField(max_length=15, unique=True, verbose_name='Index ID')),
                ('index', models.CharField(max_length=8, verbose_name='Index')),
            ],
            options={
                'verbose_name': 'Index I7',
                'verbose_name_plural': 'Indices I7',
            },
        ),
        migrations.CreateModel(
            name='IndexType',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, verbose_name='Name')),
                ('is_index_i7', models.BooleanField(default=False, verbose_name='Is Index I7?')),
                ('is_index_i5', models.BooleanField(default=False, verbose_name='Is Index I5?')),
                ('index_length', models.CharField(choices=[('6', '6'), ('8', '8')], default='8', max_length=1, verbose_name='Index Length')),
                ('indices_i5', models.ManyToManyField(blank=True, related_name='index_type', to='library_sample_shared.IndexI5', verbose_name='Indices I5')),
                ('indices_i7', models.ManyToManyField(blank=True, related_name='index_type', to='library_sample_shared.IndexI7', verbose_name='Indices I7')),
            ],
            options={
                'verbose_name': 'Index Type',
                'verbose_name_plural': 'Index Types',
            },
        ),
        migrations.CreateModel(
            name='LibraryProtocol',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=150, verbose_name='Name')),
                ('type', models.CharField(choices=[('DNA', 'DNA'), ('RNA', 'RNA')], default='DNA', max_length=3, verbose_name='Type')),
                ('provider', models.CharField(max_length=150, verbose_name='Provider')),
                ('catalog', models.CharField(max_length=150, verbose_name='Catalog')),
                ('explanation', models.CharField(max_length=250, verbose_name='Explanation')),
                ('input_requirements', models.CharField(max_length=150, verbose_name='Input Requirements')),
                ('typical_application', models.CharField(max_length=200, verbose_name='Typical Application')),
                ('comments', models.TextField(blank=True, null=True, verbose_name='Comments')),
            ],
            options={
                'verbose_name': 'Library Protocol',
                'verbose_name_plural': 'Library Protocols',
            },
        ),
        migrations.CreateModel(
            name='LibraryType',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200, verbose_name='Name')),
                ('library_protocol', models.ManyToManyField(to='library_sample_shared.LibraryProtocol', verbose_name='Library Protocol')),
            ],
            options={
                'verbose_name': 'Library Type',
                'verbose_name_plural': 'Library Types',
            },
        ),
        migrations.CreateModel(
            name='Organism',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, verbose_name='Name')),
            ],
        ),
        migrations.CreateModel(
            name='ReadLength',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=50, verbose_name='Name')),
            ],
            options={
                'verbose_name': 'Read Length',
                'verbose_name_plural': 'Read Lengths',
            },
        ),
        migrations.AlterModelOptions(
            name='libraryprotocol',
            options={'ordering': ['name'], 'verbose_name': 'Library Protocol', 'verbose_name_plural': 'Library Protocols'},
        ),
    ]