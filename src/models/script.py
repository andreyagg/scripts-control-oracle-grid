from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

db = SQLAlchemy()

class Script(db.Model):
    __tablename__ = 'scripts'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    path = db.Column(db.String(500))
    category = db.Column(db.String(50), nullable=False)
    priority = db.Column(db.String(20), nullable=False)
    status = db.Column(db.String(20), nullable=False, default='pending')
    date_applied = db.Column(db.DateTime)
    date_created = db.Column(db.DateTime, default=datetime.utcnow)
    date_updated = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    responsible = db.Column(db.String(100), default='DBA Team')
    notes = db.Column(db.Text)
    file_size = db.Column(db.Integer)
    checksum = db.Column(db.String(32))
    execution_time = db.Column(db.Integer)
    dependencies = db.Column(db.Text)  # JSON string
    
    def __repr__(self):
        return f'<Script {self.name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'path': self.path,
            'category': self.category,
            'priority': self.priority,
            'status': self.status,
            'date_applied': self.date_applied.isoformat() if self.date_applied else None,
            'date_created': self.date_created.isoformat() if self.date_created else None,
            'date_updated': self.date_updated.isoformat() if self.date_updated else None,
            'responsible': self.responsible,
            'notes': self.notes,
            'file_size': self.file_size,
            'checksum': self.checksum,
            'execution_time': self.execution_time,
            'dependencies': json.loads(self.dependencies) if self.dependencies else []
        }
    
    def from_dict(self, data):
        """Actualiza el objeto con datos de un diccionario"""
        for field in ['name', 'path', 'category', 'priority', 'status', 
                     'responsible', 'notes', 'file_size', 'checksum', 'execution_time']:
            if field in data:
                setattr(self, field, data[field])
        
        if 'date_applied' in data and data['date_applied']:
            if isinstance(data['date_applied'], str):
                self.date_applied = datetime.fromisoformat(data['date_applied'])
            else:
                self.date_applied = data['date_applied']
        
        if 'dependencies' in data:
            self.dependencies = json.dumps(data['dependencies']) if data['dependencies'] else None
        
        self.date_updated = datetime.utcnow()
    
    @staticmethod
    def get_stats():
        """Obtiene estadísticas de los scripts"""
        total = Script.query.count()
        pending = Script.query.filter_by(status='pending').count()
        applied = Script.query.filter_by(status='applied').count()
        error = Script.query.filter_by(status='error').count()
        
        return {
            'total': total,
            'pending': pending,
            'applied': applied,
            'error': error
        }
    
    @staticmethod
    def get_categories():
        """Obtiene todas las categorías únicas"""
        categories = db.session.query(Script.category).distinct().all()
        return [cat[0] for cat in categories if cat[0]]
    
    @staticmethod
    def search_and_filter(search_term=None, status=None, category=None, priority=None):
        """Busca y filtra scripts según los criterios dados"""
        query = Script.query
        
        if search_term:
            query = query.filter(Script.name.contains(search_term))
        
        if status:
            query = query.filter(Script.status == status)
        
        if category:
            query = query.filter(Script.category == category)
        
        if priority:
            query = query.filter(Script.priority == priority)
        
        return query.order_by(Script.date_created.desc()).all()

