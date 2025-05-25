from flask import Blueprint, render_template, session, redirect, url_for, flash, request, send_from_directory
from src.models.user import db, User
import os

# Modelo para produtos
class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    cover_image = db.Column(db.String(255), nullable=True)
    pdf_file = db.Column(db.String(255), nullable=True)
    is_main = db.Column(db.Boolean, default=True)  # True para produtos principais, False para bônus
    order = db.Column(db.Integer, default=0)  # Para ordenação
    
    def __repr__(self):
        return f'<Product {self.title}>'
