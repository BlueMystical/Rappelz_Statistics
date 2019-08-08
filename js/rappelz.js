var Guilds = []; //<- Guild = { guild_name: '', cant_pers: 0 };
var Clases = []; //<- Class = { class_name: '', cant_pers: 0 };
var Top100_Rank = []; //<- Player = { rank:   0, name:   null, class:  null, guild:  null, server: null, level:  0 };

var GuildsList = []; //<- Guild = { guild_name: '', cant_pers: 0 };
var ClasesList = []; //<- Class = { class_name: '', cant_pers: 0 };
var Players = []; //<- Player = { rank:   0, name:   null, class:  null, guild:  null, server: null, level:  0 };

var MaxRounds = 11;
var NroRound = 0;
var ServerDate = null;
var LocalDate = null;
var UpdateDate = null;

function Iniciar() {
    try {
        //Obtiene la Fecha y Hora del Servidor de Rappelz
        GetServerTime();
        $('#cmdGetClasses').prop('disabled', true).addClass('ui-disabled');
        
    } catch (e) {
        console.log( { title: e.name, content: e.message, useBootstrap:false } );
    }
    
    $(document).delegate('#page_name', 'pageshow', function () {
        var the_height = ($(window).height() - $(this).find('[data-role="header"]').height() - $(this).find('[data-role="footer"]').height());
        $(this).height($(window).height()).find('[data-role="content"]').height(the_height);
    });

    /******** AQUI SE ENLAZAN LOS EVENTOS DE LOS CONTROLES ***********/
    
    $(document).on("click", "#cmdConsulta", function (evt) {
        var Server = $('#cboServidores').val();
        ShowLoading('Loading..'); 
        Top100_Rank = GetRappelzRank(Server);     
    }); 
    
    $(document).on("click", "#cmdGetClasses", function (evt) {
        var Class = $('#cboClases').val();
        console.log(Class);
    }); 
    
    $(document).on("click", "#cmdHelp", function (evt) {
       $( "#myPopup" ).popup( "open", {  transition: "flip" } );
    }); 
    
}


/******* AQUI VAN OTRAS FUNCIONES COMPLEMENTARIAS ***************/

function ShowLoading(pText){
    var interval = setInterval(function(){
        $.mobile.loading("show", { textonly: "true", text: pText, textVisible: true, theme: "a", html: "" });
        clearInterval(interval);
    }, 1);
}
function HideLoading(){
    var interval = setInterval(function(){
        $.mobile.loading('hide');
        clearInterval(interval);
    },1); 
}

function GetServerTime() {
    //Valida al usuario contra el sistema de seguridad, usa AJAX para establecer la conexion, obtiene datos en formato JSON.
    try {
       
            ShowLoading('Loading..'); //<-Muestra el Loader

            var pUrl = "https://platform.webzen.com/ServerTime?callback=jQuery18205896723892883254_1561385097730&_=1561385099098";
            var _ret = "";

            $.ajax({
                url: pUrl,
                dataType: 'json',
                async: true,
                success: function (_response) {
                    if (_response !== null) {
                        //La respuesta siempre viene con Error.    
                    } else {
                        HideLoading(); //<-Oculta el loader 
                    }                    
                },
                error: function (err) {
                    //console.log(err.responseText); //jQuery18205896723892883254_1561385097730({"ServerTime":"6/24/2019 2:54:37 PM"})
                    _ret = err.responseText.split("(");
                    _ret = _ret[1];
                    _ret = _ret.substr(0, _ret.length - 1);
                    _ret = JSON.parse(_ret);
                    
                    console.log(_ret.ServerTime); //<- "6/24/2019 3:24:16 PM"                    
                    ServerDate = moment(_ret.ServerTime.replace("/", "-"), 'MM/DD/YYYY h:mm:ss a');
                    $('#srv_date').val(ServerDate.format('DD/MM/YYYY h:mm:ss a')); 
                    
                    LocalDate = new Date();  //<- Fecha y Hora Actual  
                    var tomorrow = Number(LocalDate.getDay())+1; 
                    var mes = Number(LocalDate.getMonth())+1;                    
                    var strDate = LocalDate.getFullYear() + '-' + ("0" + mes).slice(-2)  + '-' + ("0" + tomorrow).slice(-2) ;
                    
                    UpdateDate = moment.tz(strDate + ' 02:00:00' , "Etc/GMT0");

                    setInterval(function() {
                        ServerDate = moment(ServerDate).add(1, 'seconds'); 
                        $('#srv_date').val(ServerDate.format('DD/MM/YYYY h:mm:ss a'));
                        
                        LocalDate = moment(new Date());
                        var tt = moment.duration(LocalDate.diff(UpdateDate));
                        $('#update_rank_timer').val(tt.humanize() );     
                        
                    }, 1000);
                    
                    HideLoading(); //<-Oculta el loader
                }                
            });
            $.mobile.loading("hide"); //<-Oculta el loader
       
    } catch (e) {
        console.log(e);
    }
}

async function GetRappelzRank(ServerName) {
    //Valida al usuario contra el sistema de seguridad, usa AJAX para establecer la conexion, obtiene datos en formato JSON.
    var _ret = null;
    try {
       
        ShowLoading('Loading..'); //<-Muestra el Loader

        var pUrl1 = "http://en.rappelz.webzen.com/Community/Leaderboard/" + ServerName + "/All";           //<- 01-50
        var pUrl2 = "http://en.rappelz.webzen.com/Community/Leaderboard/" + ServerName + "/All/2#TopRank"; //<- 51-100
        
        var arrTop50 = []; 
        var arrNex50 = [];  
        
        $('#lbTitle').html('<h3>Loading Rank Top 100..</h3>');
        
        $.getJSON('http://www.whateverorigin.org/get?url=' + encodeURIComponent(pUrl1) + '&callback=?', function(data){
            //console.log(data.contents);
            var Response = data.contents;  
            var pos = Response.lastIndexOf('<div class="rangkingTable">');
            var x = Response.substring(0, pos);
            var y = Response.substring(pos + 27, Response.length).replace('<table>', '<table id="tabla_rangos">');                    
            Response = '<div id="rangkingTable" class="rangkingTable">' + y;

            arrTop50 = GetResponse_Rank(Response, false); //<- Obtiene el Primer Array 0-50, 
            
            $.getJSON('http://www.whateverorigin.org/get?url=' + encodeURIComponent(pUrl2) + '&callback=?', function(data){
                var Response2 = data.contents;  
                pos = Response2.lastIndexOf('<div class="rangkingTable">');
                x = Response2.substring(0, pos); //<- Localizar e identificar la Tabla de rangos
                y = Response2.substring(pos + 27, Response2.length).replace('<table>', '<table id="tabla_rangos">');                    
                Response2 = '<div id="rangkingTable" class="rangkingTable">' + y;

                arrNex50 = GetResponse_Rank(Response2, false); //<- Obtiene el Segundo array
                _ret = arrTop50.concat(arrNex50);                 //<- Fusiona los dos Arrays
                Top100_Rank = _ret;

                $('#lbTitle').html('<h3>Building Tables..</h3>');
                var player_table = BuildRankTable(Top100_Rank); 
                var guild_list = BuildGuildTable(Guilds, 10);  
                var class_list = BuildClassdTable(Clases);                  
                
                var html_table = '';
                html_table += '<div data-role="collapsibleset" data-theme="b" data-content-theme="b">';

                html_table += '    <div data-role="collapsible">';
                html_table += '        <h3>Players Ranked Top 100</h3>';
                html_table += player_table;
                html_table += '    </div>';

                html_table += '    <div data-role="collapsible" data-theme="b" data-content-theme="a">';
                html_table += '       <h3>Guilds Ranked Top 10</h3>';
                html_table += '	        <ol data-role="listview" data-inset="true" data-theme="b" data-divider-theme="a" data-count-theme="a">';
                html_table += guild_list;
                html_table += '       </ol>';
                html_table += '       <label>* Based on Number of Ranked Players</label>';
                html_table += '    </div>';

                html_table += '    <div data-role="collapsible" data-theme="b" data-content-theme="a">';
                html_table += '        <h3>Classes Top 10+</h3>';
                html_table += '	        <ol data-role="listview" data-inset="true" data-theme="b" data-divider-theme="a" data-count-theme="a">';
                html_table += class_list;
                html_table += '       </ol>';
                html_table += '       <label>* Based on Number of Ranked Players</label>';
                html_table += '    </div>';
                
                html_table += '    <div id="playerBaseTable" data-role="collapsible">';
                html_table += '        <h3>Player Base List</h3>';
                html_table += '        <form><input id="filterTable-input2" data-type="search"></form>';
                html_table += '        <table data-role="table" id="tabla_players" data-filter="true" data-input="#filterTable-input2" class="ui-body-d ui-shadow table-stripe ui-responsive" data-column-btn-theme="b" data-column-btn-text="Columns to display..." data-column-popup-theme="a"> ';
                html_table += '             <thead> <tr class="ui-bar-d">';
                html_table += '             <th data-priority="2">Rank</th>';
                html_table += '             <th>Player Name</th>';
                html_table += '             <th data-priority="3">Class</th>';
                html_table += '             <th data-priority="4">Level</th>';
                html_table += '             <th data-priority="1">Guild</th>';
                html_table += '             <th data-priority="5">Server</th>';
                html_table += '             </tr></thead>';
                html_table += '        <tbody> </tbody> '; 
                html_table += '        </table>';
                html_table += '    </div>';
                
                html_table += '<div> .. <br> </div>';                
                
                html_table += '    <div data-role="collapsible" data-theme="b" data-content-theme="a">';            
                html_table += '        <h3>Guild List</h3>';
                html_table += '         <form class="ui-filterable"><input id="filterBasic-guilds" data-type="search"></form>';
                html_table += '	        <ol id="GranListaGuilds" data-role="listview" data-inset="true" data-theme="b" data-divider-theme="a" data-count-theme="a" data-filter="true" data-input="#filterBasic-guilds"></ol>';
                html_table += '         <label>* Based on Number of Players (Number shown is a % of the Player Base Sample taken.)</label>';
                html_table += '    </div>';

                html_table += '</div><hr> ';  
                html_table += '<canvas id="ChartGuild" width="400" height="200"></canvas><hr>';
                html_table += '<canvas id="GuildChart" width="400" height="200"></canvas><hr>';
                html_table += '<canvas id="ClassChart" width="400" height="200"></canvas><hr>';                

                $('#RappelzPage').html("");
                $('#RappelzPage').append( html_table ).listview().trigger('create');
                $('#RappelzPage').listview( "refresh" );  

                $('#lbTitle').html('<h3>Building Charts..</h3>');
                BuildGuildChart(Guilds);
                BuildClassChart(Clases);                
                
                $('#lbTitle').html('<h3>Getting Player Base Sample..</h3>');
                ObtenerClases(Clases);

                //HideLoading(); //<-Oculta el loader
            });
        });
    } catch (e) {
        console.log(e);
        HideLoading();
    }
    return _ret;
}

function GetResponse_Rank (ResponseText, IsBase) {
    var _ret = [];  
    try {
        if (ResponseText !== null && typeof ResponseText !== "undefined" ){

            var html = $(ResponseText);
            var table = $('#tabla_rangos', html);
            
            table.each(function(){
                $(this).find('tr').each(function(i, tr){
                    //console.log($(this));
                    if (i > 0) {
                        var player = {
                            rank:   0,
                            name:   null,
                            class:  null,
                            guild:  null,
                            server: null,
                            level:  0
                        };
                        
                        $(this).find('td').each(function(index, td){
                            //console.log($(this));                                  
                            switch(index) {
                              case 0: player.rank =     Number($(this)["0"].innerText); break;
                              case 2: player.name =     $(this)["0"].innerText.trim();  break;
                              case 3: player.class =    $(this)["0"].innerText;         break;
                              case 4: player.guild =    $(this)["0"].innerText;         break;
                              case 5: player.server =   $(this)["0"].innerText;         break;
                              case 6: player.level =    Number($(this)["0"].innerText); break;
                            };                                  
                        });
                        //console.log(player); 
                        if (IsBase == true) {
                            Players.push(player);
                        } else {
                            _ret.push(player);
                        }
                    };
                });
                //console.log(_ret);
            });            
        }
    } catch (e) {
        console.log(e);
    }
    return _ret;
}

function BuildRankTable (jsonData){
    var _ret = '';
    try {
        if (typeof jsonData !== "undefined" && jsonData !== null && jsonData!= '') {
            
            var Header = '<form><input id="filterTable-input" data-type="search"></form>';
            Header = Header + '<table data-role="table" id="tabla_rangos" data-filter="true" data-input="#filterTable-input"';
            Header = Header + '  class="ui-body-d ui-shadow table-stripe ui-responsive" data-column-btn-theme="b"';
            Header = Header + '  data-column-btn-text="Columns to display..." data-column-popup-theme="a">';
            Header = Header + '<thead> <tr class="ui-bar-d">';
            Header = Header + ' <th data-priority="2">Rank</th> ';
            Header = Header + ' <th>Player Name</th>';
            Header = Header + ' <th data-priority="3">Class</th>';
            Header = Header + ' <th data-priority="4">Level</th>';
            Header = Header + ' <th data-priority="1">Guild</th>';
            Header = Header + ' <th data-priority="5">Server</th>';
            Header = Header + '</tr> </thead>';
            
            var Body = '<tbody>'; 
            
            jsonData.forEach(function (player_rank) {                
                //Cargar Estadisticas de la Guild:
                var index = IsGuild(player_rank.guild, Guilds);
                if (index < 0)
                { 
                    //La guild No existe, hay que agregarla
                    Guilds.push({
                        guild_name: player_rank.guild,
                        cant_pers:  1 
                    });
                } else {
                    //La Guild si existe
                    ++Guilds[index].cant_pers;
                }
                
                //Contar las Clases:
                index = IsClass(player_rank.class, Clases);
                if (index < 0) { 
                    //La Clase No existe, hay que agregarla
                    Clases.push({
                        class_name: player_rank.class,
                        cant_pers:  1 
                    });
                } else {
                    //La Clase si existe
                    ++Clases[index].cant_pers;
                }
                
                Body += '<tr>'; //Construir una Fila de la Tabla
                Body += '   <th>' + player_rank.rank +  '</th>';
                Body += '   <th>' + player_rank.name +  '</th>';
                Body += '   <th>' + player_rank.class + '</th>';
                Body += '   <th>' + player_rank.level + '</th>';
                Body += '   <th>' + player_rank.guild + '</th>';
                Body += '   <th>' + player_rank.server + '</th>';                
                Body += '</tr>';
            });
            
            //Ordenar el Ranking the Guilds de Mayor a menor x Cantidad de Players:            
            Guilds.sortBy("cant_pers", true);
            Clases.sortBy("cant_pers", true);
            
            console.log(Guilds);
            console.log(Clases);
            
            _ret = Header + Body + '</tbody> </table>';
        }
    }catch (e) {
        console.log(e);
    }
    return _ret;
}



function BuildGuildTable (jsonData, MaxNumber){
    var _ret = '';
    try {
        if (typeof jsonData !== "undefined" && jsonData !== null && jsonData != '') {            
            var index = 1;
            jsonData.some(function(_guild) {   
                if (index <= MaxNumber) {
                    if (_guild.guild_name != '') {
                        _ret += '<li>' + _guild.guild_name + '<span class="ui-li-count">' + _guild.cant_pers + '</span></li>';
                        ++index;
                    };
                };
            });            
        };
    }catch (e) {
        console.log(e);
    }
    return _ret;
}
    
function BuildGuildChart (jsonData){
    try {
        if (typeof jsonData !== "undefined" && jsonData !== null && jsonData != '') {
            
            var _guild_names = [];
            var _guild_cants = [];
            
            //console.log(jsonData);
            
            jsonData.forEach(function (_guild) {
                if (_guild.guild_name != '') {
                    _guild_names.push(_guild.guild_name); 
                    _guild_cants.push(_guild.cant_pers); 
                }               
            });
            
            var ctx = document.getElementById('GuildChart').getContext('2d');
            var myChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: _guild_names,
                    datasets: [{
                        label: '# of Ranked Players',
                        data: _guild_cants,
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 206, 86, 0.2)',
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(153, 102, 255, 0.2)',
                            'rgba(255, 159, 64, 0.2)',
                            'rgba(63, 191, 127, 0.2)',
                            'rgba(207, 47, 197, 0.2)',
                            'rgba(219, 229, 70, 0.2)',
                            'rgba(81, 70, 229, 0.2)',
                            'rgba(240, 151, 34, 0.2)'
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)',
                            'rgba(63, 191, 127, 1)',
                            'rgba(207, 47, 197, 1)',
                            'rgba(219, 229, 70, 1)',
                            'rgba(81, 70, 229, 1)',
                            'rgba(240, 151, 34, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    },
                    title: {
                        display: true,
                        text: 'Guilds by Rank',
                        fontSize: 14
                    },
                    legend: { display: false }
                }
            });            
        };
    }catch (e) {
        console.log(e);
    }
}
function BuildGuildChart2 (jsonData){
    try {
        if (typeof jsonData !== "undefined" && jsonData !== null && jsonData != '') {
            
            var _guild_names = [];
            var _guild_cants = [];
            
            //console.log(jsonData);
            
            jsonData.forEach(function (_guild) {
                if (_guild.guild_name != '') {
                    _guild_names.push(_guild.guild_name); 
                    _guild_cants.push(_guild.cant_pers); 
                }               
            });
            
            var ctx = document.getElementById('ChartGuild').getContext('2d');
            var myChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: _guild_names,
                    datasets: [{
                        label: '# of Players',
                        data: _guild_cants,
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 206, 86, 0.2)',
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(153, 102, 255, 0.2)',
                            'rgba(255, 159, 64, 0.2)',
                            'rgba(63, 191, 127, 0.2)',
                            'rgba(207, 47, 197, 0.2)',
                            'rgba(219, 229, 70, 0.2)',
                            'rgba(81, 70, 229, 0.2)',
                            'rgba(240, 151, 34, 0.2)'
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)',
                            'rgba(63, 191, 127, 1)',
                            'rgba(207, 47, 197, 1)',
                            'rgba(219, 229, 70, 1)',
                            'rgba(81, 70, 229, 1)',
                            'rgba(240, 151, 34, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    },
                    title: {
                        display: true,
                        text: 'Guilds by Popularity',
                        fontSize: 14
                    },
                    legend: { display: false }
                }
            });            
        };
    }catch (e) {
        console.log(e);
    }
}

function BuildClassdTable (jsonData){
    var _ret = '';
    try {
        if (typeof jsonData !== "undefined" && jsonData !== null && jsonData != '') {
            
            var index = 1;
            jsonData.some(function(_class) {   
                
                    if (_class.class_name != '') {
                        _ret += '<li><a href="#">' + _class.class_name + '<span class="ui-li-count">' + _class.cant_pers + '</span></a></li>';
                        ++index;
                    };
                
            });            
        };
    }catch (e) {
        console.log(e);
    }
    return _ret;
}
function BuildClassChart (jsonData){
    try {
        if (typeof jsonData !== "undefined" && jsonData !== null && jsonData != '') {
            
            var _names = [];
            var _cants = [];
            
            //console.log(jsonData);
            
            jsonData.forEach(function (_class) {
                if (_class.class_name != '') {
                    _names.push(_class.class_name); 
                    _cants.push(_class.cant_pers); 
                }               
            });
            
            var ctx = document.getElementById('ClassChart').getContext('2d');
            var myChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: _names,
                    datasets: [{
                        label: '# of Ranked Players',
                        data: _cants,
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 206, 86, 0.2)',
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(153, 102, 255, 0.2)',
                            'rgba(255, 159, 64, 0.2)',
                            'rgba(63, 191, 127, 0.2)',
                            'rgba(207, 47, 197, 0.2)',
                            'rgba(219, 229, 70, 0.2)',
                            'rgba(81, 70, 229, 0.2)',
                            'rgba(240, 151, 34, 0.2)'
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)',
                            'rgba(63, 191, 127, 1)',
                            'rgba(207, 47, 197, 1)',
                            'rgba(219, 229, 70, 1)',
                            'rgba(81, 70, 229, 1)',
                            'rgba(240, 151, 34, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    },
                    title: {
                        display: true,
                        text: 'Jobs by Rank',
                        fontSize: 14
                    }
                }
            });            
        };
    }catch (e) {
        console.log(e);
    }
}

function ObtenerClases (pClases) {
    if (typeof pClases !== "undefined" && pClases !== null && pClases != '') {
        
        //console.log(pClases);
        var index = 1; MaxRounds = 11;
        pClases.some(function(_clase) {   
            if (index <= MaxRounds) {
                if (_clase.class_name != '') {
                    
                    GetRappelzPlayerBase(_clase.class_name, index);     
                    ++index;
                };
            }
        }); 
        if (typeof Players !== "undefined" && Players !== null && Players != '') {
            console.log(Players);
        };
    };
}

function GetRappelzPlayerBase(Class, index) {
    //Valida al usuario contra el sistema de seguridad, usa AJAX para establecer la conexion, obtiene datos en formato JSON.
    var _ret = null;
    try {        
        Class = Class.replace(' ', '-');
        var url = 'http://en.rappelz.webzen.com/Community/Leaderboard/Unicorn/' + Class;
        
        var arrTop50 = []; //<- Primeros 50 resultados
        var arrNex50 = []; //<- Siguientes 50 resultados
        
        $.getJSON('http://www.whateverorigin.org/get?url=' + encodeURIComponent(url) + '/1&callback=?', function(data){
            //console.log(data.contents);           
            
            var Response = data.contents;  
            var pos = Response.lastIndexOf('<div class="rangkingTable">');
            var x = Response.substring(0, pos);
            var y = Response.substring(pos + 27, Response.length).replace('<table>', '<table id="tabla_rangos">');                    
            Response = '<div id="rangkingTable" class="rangkingTable">' + y;

            arrTop50 = GetResponse_Rank(Response, true); //<- Obtiene el Primer Array 0-50
            
            $.getJSON('http://www.whateverorigin.org/get?url=' + encodeURIComponent(url) + '/2&callback=?', function(data){
                console.log('Cargando..' + Class + ' i=' + index);
                $('#lbTitle').html('<h3>Loading..' + Class + '</h3>');
                
                var Response2 = data.contents;  
                pos = Response2.lastIndexOf('<div class="rangkingTable">');
                x = Response2.substring(0, pos); // Localizar e identificar la Tabla de rangos
                y = Response2.substring(pos + 27, Response2.length).replace('<table>', '<table id="tabla_rangos">');                    
                Response2 = '<div id="rangkingTable" class="rangkingTable">' + y;

                arrNex50 = GetResponse_Rank(Response2, true); //<- Obtiene el Segundo array

                _ret = arrTop50.concat(arrNex50);//<- Fusiona los dos Arrays  
                ++NroRound;
                //console.log(_ret);
                
                if (NroRound >= 11) {
                    console.log('Terminado.');
                    $('#lbTitle').html('<h3>Rappelz Statistics</h3>');
                    
                    //Ordenar el Ranking the Guilds de Mayor a menor x Cantidad de Players:                    
                    Players.sortBy("level", true, "rank", true);
                    var player_table = BuildPlayerBaseTable(Players); 
                    
                    GuildsList.sortBy("cant_pers", true);
                    
                    $("#tabla_players > tbody").html("");
                    $("#tabla_players > tbody").append(player_table);
                    $("#tabla_players").table("refresh");
                    
                    BuildGuildChart2(GuildsList);
                    var guild_list = BuildGuildTable(GuildsList, GuildsList.length);  
                    
                    $('#GranListaGuilds').empty();
                    $('#GranListaGuilds').append( guild_list ).listview().trigger('create');
                    $('#GranListaGuilds').listview( "refresh" );  
                    
                    console.log(GuildsList);
                    console.log(ClasesList);
                    console.log(Players);
                    
                    HideLoading();
                }
                
            });
        });
    } catch (e) {
        console.log(e);
        HideLoading();
    }
    return _ret;
}
function BuildPlayerBaseTable (jsonData){
    var _ret = '';
    try {
        if (typeof jsonData !== "undefined" && jsonData !== null && jsonData!= '') {
            
            var Body = ''; 
            
            jsonData.forEach(function (_player) {
                
                //Cargar Estadisticas de la Guild:
                var index = IsGuild(_player.guild, GuildsList);
                if (index < 0)
                { 
                    //La guild No existe, hay que agregarla
                    GuildsList.push({
                        guild_name: _player.guild,
                        cant_pers:  1 
                    });
                } else {
                    //La Guild si existe
                    ++GuildsList[index].cant_pers;
                }
                
                //Contar las Clases:
                index = IsClass(_player.class, ClasesList);
                if (index < 0)
                { 
                    //La Clase No existe, hay que agregarla
                    ClasesList.push({
                        class_name: _player.class,
                        cant_pers:  1 
                    });
                } else {
                    //La Guild si existe
                    ++ClasesList[index].cant_pers;
                }
                
                Body += '<tr>'; //Construir una Fila de la Tabla
                Body += '   <th>' + _player.rank +  '</th>';
                Body += '   <th>' + _player.name +  '</th>';
                Body += '   <th>' + _player.class + '</th>';
                Body += '   <th>' + _player.level + '</th>';
                Body += '   <th>' + _player.guild + '</th>';
                Body += '   <th>' + _player.server + '</th>';                
                Body += '</tr>';
            });
            _ret = Body;
        }
    }catch (e) {
        console.log(e);
    }
    return _ret;
}

function IsGuild(GuildName, GuildArr){
    // Verifica si la Guild ya ha sido ingresada y devuelve su indice.
    var _ret = -1;
    if (typeof GuildArr !== "undefined" && GuildArr !== null && GuildArr!= '') {
        var index = 0;
        GuildArr.some(function(_guild) {
            //console.log(_guild);            
            if (_guild.guild_name == GuildName) {
                _ret = index;
            };
            ++index;
        });
    }
    return _ret;
}
function IsClass(ClassName, ClassArr){
    // Verifica si la Clase ya ha sido ingresada y devuelve su indice.
    var _ret = -1;
    if (typeof ClassArr !== "undefined" && ClassArr !== null && ClassArr != '') {
        var index = 0;
        ClassArr.some(function(_clase) {         
            if (_clase.class_name == ClassName) {
                _ret = index;
            };
            ++index;
        });
    }
    return _ret;
}

//[Metodo de Extension para los Arrays]
//Permite Ordenar el Array x uno o mas de sus campos, 
Array.prototype.sortBy = function (propertyName, sortDirection) {
    var sortArguments = arguments;
    this.sort(function (objA, objB) {
        var result = 0;
        for (var argIndex = 0; argIndex < sortArguments.length && result === 0; argIndex += 2) {

            var propertyName = sortArguments[argIndex];
            result = (objA[propertyName] < objB[propertyName]) ? -1 : (objA[propertyName] > objB[propertyName]) ? 1 : 0;

            //Reverse if sort order is false (DESC)
            result *= !sortArguments[argIndex + 1] ? 1 : -1;
        }
        return result;
    });
}

function addDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
