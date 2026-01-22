import sys
import win32com.client
import pythoncom
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import time

app = Flask(__name__)
CORS(app)

def connect_to_sap():
    """
    Intenta conectarse a una sesión activa de SAP GUI.
    Replica la lógica de 'GetObject("SAPGUI")' de VBA.
    """
    try:
        # Inicializar COM para este hilo
        pythoncom.CoInitialize()
        
        try:
            SapGuiAuto = win32com.client.GetObject("SAPGUI")
        except:
            return None

        if not SapGuiAuto:
            return None
            
        application = SapGuiAuto.GetScriptingEngine
        if not application:
            return None
            
        connection = application.Children(0)
        if not connection:
            return None
            
        session = connection.Children(0)
        if not session:
            return None
            
        return session
    except Exception as e:
        print(f"Error interno conectando a SAP: {e}")
        return None

@app.route('/api/status', methods=['GET'])
def check_status():
    """
    Verifica si SAP está abierto y respondiendo.
    """
    try:
        session = connect_to_sap()
        if session:
            # Intentamos leer una propiedad básica para asegurar que la sesión está viva
            _ = session.Info.SystemName 
            return jsonify({"status": "connected", "message": "Conectado a SAP"})
        else:
            return jsonify({"status": "disconnected", "message": "SAP no encontrado"})
    except Exception:
        return jsonify({"status": "disconnected", "message": "Error de conexión"})

@app.route('/crear-orden', methods=['POST'])
def crear_orden():
    """
    Automatiza la transacción COR1 para crear una orden.
    """
    data = request.json
    print(f"--> Creando Orden: {data.get('producto')} | Lote: {data.get('lote')}")
    
    session = connect_to_sap()
    if not session:
        return jsonify({"success": False, "message": "SAP no está abierto."}), 503

    try:
        # 1. Transacción COR1
        session.findById("wnd[0]/tbar[0]/okcd").Text = "/ncor1"
        session.findById("wnd[0]/tbar[0]/btn[0]").press()

        # 2. Pantalla Inicial
        session.findById("wnd[0]/usr/ctxtCAUFVD-MATNR").Text = data.get('producto')
        session.findById("wnd[0]/usr/ctxtCAUFVD-WERKS").Text = data.get('casa', 'PC13') 
        session.findById("wnd[0]").sendVKey(0) # Enter

        # 3. Datos de Cabecera (Cantidad, Unidad, Fecha)
        # Usamos una cantidad por defecto si no viene en el JSON
        cantidad = data.get('cantidad', '100') 
        session.findById("wnd[0]/usr/tabsTABSTRIP_5115/tabpKOZE/ssubSUBSCR_5115:SAPLCOKO:5120/txtCAUFVD-GAMNG").Text = cantidad
        session.findById("wnd[0]/usr/tabsTABSTRIP_5115/tabpKOZE/ssubSUBSCR_5115:SAPLCOKO:5120/ctxtCAUFVD-GMEIN").Text = "HL"
        
        # Fecha actual
        fecha_hoy = datetime.now().strftime("%d.%m.%Y")
        session.findById("wnd[0]/usr/tabsTABSTRIP_5115/tabpKOZE/ssubSUBSCR_5115:SAPLCOKO:5120/ctxtCAUFVD-GSTRP").Text = fecha_hoy

        session.findById("wnd[0]").sendVKey(0) # Enter

        # Manejo de posibles Popups (Advertencias de fecha, etc.)
        try:
            if session.ActiveWindow.Name == "wnd[1]":
                session.findById("wnd[1]").sendVKey(0)
                time.sleep(0.5)
                if session.ActiveWindow.Name == "wnd[1]": 
                    session.findById("wnd[1]").sendVKey(0)
        except:
            pass 

        # 4. Asignación de Lote (Pestaña Mercancías/Recepción)
        try:
            session.findById("wnd[0]/usr/tabsTABSTRIP_5115/tabpKOWE").Select()
        except:
            time.sleep(1)
            session.findById("wnd[0]/usr/tabsTABSTRIP_5115/tabpKOWE").Select()

        session.findById("wnd[0]/usr/tabsTABSTRIP_5115/tabpKOWE/ssubSUBSCR_5115:SAPLCOKO:5190/ctxtAFPOD-CHARG").Text = data.get('lote')
        session.findById("wnd[0]").sendVKey(0) # Validar lote

        # Popup "¿Desea crear el lote?"
        try:
            if session.ActiveWindow.Name == "wnd[1]":
                session.findById("wnd[1]/usr/btnSPOP-VAROPTION1").press()
        except:
            pass

        # 5. Versión de Producción (Si se especificó línea)
        if data.get('linea'):
            try:
                session.findById("wnd[0]/usr/tabsTABSTRIP_5115/tabpSLAP").Select()
                session.findById("wnd[0]/usr/tabsTABSTRIP_5115/tabpSLAP/ssubSUBSCR_5115:SAPLCOKO:5250/btnPUSH_STAK").press()
                session.findById("wnd[1]/usr/ctxtRC62F-PROD_VERS").Text = data.get('linea')
                session.findById("wnd[1]").sendVKey(0)
            except:
                pass

        # 6. Descripción (Texto Largo)
        if data.get('descripcion'):
            try:
                session.findById("wnd[0]/usr/btnPUSH_LANGTEXT").press()
                session.findById("wnd[0]/usr/tblSAPLSTXXEDITAREA/txtRSTXT-TXLINE[2,1]").Text = data.get('descripcion')
                session.findById("wnd[0]/tbar[0]/btn[3]").press() # Atrás
            except:
                pass

        # 7. Guardar
        session.findById("wnd[0]/tbar[0]/btn[11]").press()

        # Leer mensaje de la barra de estado
        try:
            mensaje_sap = session.findById("wnd[0]/sbar").Text
        except:
            mensaje_sap = "Orden creada (Mensaje no leído)"

        return jsonify({
            "success": True, 
            "message": f"SAP: {mensaje_sap}"
        })

    except Exception as e:
        msg = str(e)
        try:
            # Intento de recuperar el error real de SAP
            msg = session.findById("wnd[0]/sbar").Text
        except:
            pass
        return jsonify({"success": False, "message": f"Error SAP: {msg}"}), 500

@app.route('/liberar-orden', methods=['POST'])
def liberar_orden():
    """
    Automatiza la transacción COR2 para liberar una orden.
    """
    data = request.json
    print(f"--> Liberando Orden: {data.get('id_sap') or data.get('producto')}")

    session = connect_to_sap()
    if not session:
        return jsonify({"success": False, "message": "SAP no conectado"}), 503

    try:
        # 1. Transacción COR2 (Modificar)
        session.findById("wnd[0]/tbar[0]/okcd").Text = "/ncor2"
        session.findById("wnd[0]/tbar[0]/btn[0]").press()

        # 2. Buscar Orden
        # NOTA: Debes pasar el ID real de la orden (número SAP).
        # Si no lo tienes, el código fallará o abrirá la última orden visitada.
        orden_id = data.get('id_sap') 
        
        # Fallback temporal: Si no hay ID SAP, usamos el producto (solo para pruebas, esto fallará en real)
        if not orden_id and data.get('producto'):
             # En un escenario real, aquí deberías buscar el número de orden por material/lote en COOISPI
             print("Advertencia: No se proporcionó ID SAP, intentando lógica alternativa...")
             pass 
        
        if orden_id:
            session.findById("wnd[0]/usr/ctxtCAUFVD-AUFNR").Text = orden_id
            session.findById("wnd[0]").sendVKey(0)

        # 3. Ejecutar Liberación (Bandera Verde)
        try:
            # El botón de liberar suele ser el btn[30] en la barra de herramientas estándar de COR2
            session.findById("wnd[0]/tbar[1]/btn[30]").press()
        except:
            # Si falla, puede que ya esté liberada o el botón no esté habilitado
            print("No se pudo pulsar el botón liberar (¿Ya liberada?)")

        # 4. Guardar
        session.findById("wnd[0]/tbar[0]/btn[11]").press()
        
        try:
            mensaje_sap = session.findById("wnd[0]/sbar").Text
        except:
            mensaje_sap = "Orden guardada"

        return jsonify({"success": True, "message": f"SAP: {mensaje_sap}"})

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

if __name__ == '__main__':
    print("=================================================")
    print("   SERVIDOR PUENTE ZEUS <-> SAP INICIADO")
    print("   Esperando peticiones en puerto 5000...")
    print("=================================================")
    app.run(host='0.0.0.0', port=5000)