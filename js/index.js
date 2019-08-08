var usuario_logeado = null;
var jsonConfig = null;

// https://craftpip.github.io/jquery-confirm

function Iniciar() {
    try {
        //Cargar el archivo de configuracion
        $.getJSON('appconfig.json', function (data) {

            jsonConfig = data; //console.log(jsonConfig);	     
            /*usuario_logeado = JSON.parse(decodeURI(urlParam('user'))); //console.log(usuario_logeado);

            //Si se pasó el usuario por parametros
            if (usuario_logeado != null) {
                //IniciarSesion();
            } else {
                console.log('mostrar Popup');
                var timeoutID = window.setTimeout(showPopUp, 1000); //<-Espera 1 segundo y muestra la ventana de Login
            }*/

        });
    } catch (e) {
        $.alert({ title: e.name, content: e.message, useBootstrap:false });
    }

    //Si NO se requiere iniciar sesion, comentar la linea de arriba y descomentar la siguiente:
    //IniciarSesion();

    /******** AQUI SE ENLAZAN LOS EVENTOS DE LOS CONTROLES ***********/
    $(document).on("click", "#cmdIniciarSesion", function (evt) {
        mLogedUser = LogearUsuario();
    });

    $('#txtUserName').keypress(function (event) {
        if (event.keyCode == 13) {
            $('#txtPassword').focus();
        }
    });

    $('#txtPassword').keypress(function (event) {
        if (event.keyCode == 13) {
            mLogedUser = LogearUsuario();
        }
    });

    $(document).on("click", "#cmdValidarUsuario", function (evt) {
        mLogedUser = LogearUsuario();
    });

    $(document).on("click", "#cmdIniciarSesion", function (evt) {
        //Fuerza la recarga de la pagina para cerrar la sesión:
        window.location.reload();
    });

    $(document).on("click", "#cmdObtenerWS", function (evt) {
        //F
        //ObtenerWS_JSON();
    });
}

/******* AQUI VAN OTRAS FUNCIONES COMPLEMENTARIAS ***************/
function showPopUp() {
    $("#myPopup").popup("open", {
        positionTo: 'window',
        transition: "flip"
    });
    $('#txtUserName').focus();
}

function hidePopUp() {
    $("#myPopup").popup("close");
    $("#contenido").show();
}

function ShowLoading(pText){
    var interval = setInterval(function(){
        $.mobile.loading("show", { textonly: "true", text: pText, textVisible: true, theme: "a", html: "" });
        clearInterval(interval);
    },1);
}
function HideLoading(){
    var interval = setInterval(function(){
        $.mobile.loading('hide');
        clearInterval(interval);
    },1); 
}

function urlParam(pNombreParametro) {
    //Esta funcion devuelve el valor del parametro especificado si existe
    var results = new RegExp('[\\?&]' + pNombreParametro + '=([^&#]*)').exec(window.location.href);
    if (results == null) {
        return null;
    } else {
        return results[1] || 0;
    }
}

function supports_html5_storage() {
    //Verifica el soperte del navegador para HTML5 y Local Storage
    try {
        return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
        return false;
    }
}

function LogearUsuario() {
    //Valida al usuario contra el sistema de seguridad, usa AJAX para establecer la conexion, obtiene datos en formato JSON.
    var bLogedUser = false;
    try {
        var pUser = $("#txtUserName").val();
        var pPass = $("#txtPassword").val();

        if (pUser != '' && pPass != '') {
            ShowLoading('Validando..'); //<-Muestra el Loader

            //La ruta del servidor se carga desde el archivo de configuracion:
            //http://localhost/fase3web/?query=u_getinfo&user=244145&pass=5462
            var pUrl = jsonConfig.web_services.default.url + "/?query=u_getinfo&user=" + pUser + "&pass=" + pPass;

            $.ajax({
                url: pUrl,
                dataType: 'json',
                async: true,
                success: function (u_login) {
                    if (u_login !== null) {
                        //console.log(u_login);
                        $("#lblLogin").text(u_login.nombre_usuario);
                        var timeoutID = window.setTimeout(hidePopUp, 500);
                        usuario_logeado = u_login;
                        
                        //IniciarSesion();
                        $( ":mobile-pagecontainer" ).pagecontainer( "change", '#pageChat', { transition: 'slidefade' } );
                        
                        //Transitions: fade, pop, flip, turn, flow, slide, slidefade, slideup, slidedown, none
                        
                    } else {
                        HideLoading(); //<-Oculta el loader
                        $("#lblLogin").text("No se pudo validar al usuario!");
                        
                        new Noty({ type: 'error', layout: 'centerLeft', theme: 'relax', 
                            text: "Usuario o Clave Incorrectos, intente de nuevo",
                            timeout: 5000, progressBar: true, closeWith: ['click', 'button'],
                            animation: { open: 'noty_effects_open', close: 'noty_effects_close' }
                        }).show();
                    }
                    
                },
                error: function (err) {
                    console.log('ERROR INESPERADO: ' + err.responseText);
                    HideLoading(); //<-Oculta el loader
                    $.alert({ title: 'Error:', content: err.responseText, useBootstrap:false });
                }                
            });
            $.mobile.loading("hide"); //<-Oculta el loader
        }
    } catch (e) {
        $.alert({ title: e.name, content: e.message, useBootstrap:false });
    }
    return bLogedUser;
}
