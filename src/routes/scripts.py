from flask import Blueprint, request, jsonify
from src.models.script import Script, db
from datetime import datetime
import json

scripts_bp = Blueprint('scripts', __name__)

@scripts_bp.route('/scripts', methods=['GET'])
def get_scripts():
    """Obtiene todos los scripts con filtros opcionales"""
    try:
        search_term = request.args.get('search', '')
        status = request.args.get('status', '')
        category = request.args.get('category', '')
        priority = request.args.get('priority', '')
        
        scripts = Script.search_and_filter(
            search_term=search_term if search_term else None,
            status=status if status else None,
            category=category if category else None,
            priority=priority if priority else None
        )
        
        return jsonify({
            'success': True,
            'data': [script.to_dict() for script in scripts],
            'count': len(scripts)
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@scripts_bp.route('/scripts', methods=['POST'])
def create_script():
    """Crea un nuevo script"""
    try:
        data = request.get_json()
        
        if not data or not data.get('name') or not data.get('category'):
            return jsonify({
                'success': False,
                'error': 'Nombre y categoría son requeridos'
            }), 400
        
        script = Script()
        script.from_dict(data)
        
        db.session.add(script)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'data': script.to_dict(),
            'message': 'Script creado exitosamente'
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@scripts_bp.route('/scripts/<int:script_id>', methods=['GET'])
def get_script(script_id):
    """Obtiene un script específico por ID"""
    try:
        script = Script.query.get(script_id)
        
        if not script:
            return jsonify({
                'success': False,
                'error': 'Script no encontrado'
            }), 404
        
        return jsonify({
            'success': True,
            'data': script.to_dict()
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@scripts_bp.route('/scripts/<int:script_id>', methods=['PUT'])
def update_script(script_id):
    """Actualiza un script existente"""
    try:
        script = Script.query.get(script_id)
        
        if not script:
            return jsonify({
                'success': False,
                'error': 'Script no encontrado'
            }), 404
        
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'error': 'No se proporcionaron datos'
            }), 400
        
        script.from_dict(data)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'data': script.to_dict(),
            'message': 'Script actualizado exitosamente'
        })
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@scripts_bp.route('/scripts/<int:script_id>', methods=['DELETE'])
def delete_script(script_id):
    """Elimina un script"""
    try:
        script = Script.query.get(script_id)
        
        if not script:
            return jsonify({
                'success': False,
                'error': 'Script no encontrado'
            }), 404
        
        db.session.delete(script)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Script eliminado exitosamente'
        })
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@scripts_bp.route('/scripts/<int:script_id>/apply', methods=['POST'])
def apply_script(script_id):
    """Marca un script como aplicado"""
    try:
        script = Script.query.get(script_id)
        
        if not script:
            return jsonify({
                'success': False,
                'error': 'Script no encontrado'
            }), 404
        
        script.status = 'applied'
        script.date_applied = datetime.utcnow()
        script.date_updated = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'data': script.to_dict(),
            'message': 'Script marcado como aplicado'
        })
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@scripts_bp.route('/scripts/stats', methods=['GET'])
def get_stats():
    """Obtiene estadísticas de los scripts"""
    try:
        stats = Script.get_stats()
        return jsonify({
            'success': True,
            'data': stats
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@scripts_bp.route('/scripts/categories', methods=['GET'])
def get_categories():
    """Obtiene todas las categorías disponibles"""
    try:
        categories = Script.get_categories()
        return jsonify({
            'success': True,
            'data': categories
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@scripts_bp.route('/scripts/export', methods=['GET'])
def export_scripts():
    """Exporta todos los scripts en formato JSON"""
    try:
        scripts = Script.query.all()
        data = [script.to_dict() for script in scripts]
        
        return jsonify({
            'success': True,
            'data': data,
            'count': len(data),
            'exported_at': datetime.utcnow().isoformat()
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@scripts_bp.route('/scripts/import', methods=['POST'])
def import_scripts():
    """Importa scripts desde un archivo JSON"""
    try:
        data = request.get_json()
        
        if not data or not isinstance(data, list):
            return jsonify({
                'success': False,
                'error': 'Se esperaba un array de scripts'
            }), 400
        
        imported_count = 0
        errors = []
        
        for script_data in data:
            try:
                # Verificar si ya existe un script con el mismo nombre
                existing = Script.query.filter_by(name=script_data.get('name')).first()
                
                if existing:
                    # Actualizar script existente
                    existing.from_dict(script_data)
                else:
                    # Crear nuevo script
                    script = Script()
                    script.from_dict(script_data)
                    db.session.add(script)
                
                imported_count += 1
                
            except Exception as e:
                errors.append(f"Error importando '{script_data.get('name', 'unknown')}': {str(e)}")
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'{imported_count} scripts importados exitosamente',
            'imported_count': imported_count,
            'errors': errors
        })
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

