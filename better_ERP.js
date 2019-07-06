// ==UserScript==
// @name         ERP mods
// @namespace    Hare Krishna
// @version      1
// @description  Block the Annoying Update Popup, get links for syllabus
// @author       Moi
// @match        https://erp.iitkgp.ac.in/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

var interval1 = null;
var interval2 = null;
var chk_fn_running = 0;
var links_injected = 0;

(function() {
    'use strict';
    
    // Block annoying popup of registration update
    var _open = XMLHttpRequest.prototype.open;
    window.XMLHttpRequest.prototype.open = function (method, URL) {
        var _onreadystatechange = this.onreadystatechange,
            _this = this;

        _this.onreadystatechange = function () {
            // This script must be run before page loads
            if (_this.readyState === 4 && _this.status === 200 && URL.indexOf('/commonStakeholderIdentificationCallStatus')+1) {
                try {
                    var data = _this.responseText;
                    if (data === 'TRUE') {
                        data = 'FALSE';
                    }
                    else {
                        alert('Registration Form Update popup responded with unexpectedly!')
                        alert(data)
                    }
                    // rewrite responseText
                    Object.defineProperty(_this, 'responseText', {value: data});
                    /////////////// END //////////////////
                } catch (e) {alert(e);}

                console.log('Caught! :)', method, URL, _this.responseText);
            }
            // call original callback
            if (_onreadystatechange) _onreadystatechange.apply(this, arguments);
        };

        // detect any onreadystatechange changing
        Object.defineProperty(this, "onreadystatechange", {
            get: function () {
                return _onreadystatechange;
            },
            set: function (value) {
                _onreadystatechange = value;
            }
        });

        return _open.apply(_this, arguments);
    };

    // Add links to syllabus
    injectLinks();

})();

function injectLinks() {
    interval1 = setInterval(linkify_Subjects, 100);
}

function linkify_Subjects() {
    if (location.href.match(/(\.)*SubjectList.jsp/gi)) {
        var trs = document.getElementsByTagName('tr');
        for (var i=0; i<trs.length; i++) {
            var tr = trs[i];
            var cell = tr.cells[0];
            var sub_code = cell.innerText;
            if (/^(\w{2}\d{5})$/.test(sub_code)) {
                //console.log(`Cell hit: ${sub_code}`);
                cell.innerHTML = '<a href="' + 'https://erp.iitkgp.ac.in/Acad/subject/get_syllabus_pdf.jsp?year=20092&subno=' + sub_code + '" target="_blank">' + sub_code + '</a>';
                links_injected = 1;
            }
        }
        if (links_injected) {
            clearInterval(interval1);
            //console.warn('Stopped injecting Links!');
            console.log('Checking for change in table data....')
            interval2 = setInterval(check_table_data_change, 1000);
            //if (chk_fn_running == 0) check_for_Change();
        }
    }
}

var prev_sub_code = null;
function check_table_data_change() {
    var trs = document.getElementsByTagName('tr');
    for (var i=0; i<trs.length; i++) {
        var tr = trs[i];
        var cell = tr.cells[0];
        var sub_code = cell.innerText;
        if (/^(\w{2}\d{5})$/.test(sub_code)) {
            if (prev_sub_code != sub_code) {
                // Add links to syllabus
                injectLinks();
                prev_sub_code = sub_code;
                clearInterval(interval2);
                //console.warn('Stopped checking table data!');
                links_injected = 0;
            }
            break;
        }
    }
}

////////////////////////////////////////////////
// Can be used with a larger timeout value (is more efficient)
function check_for_Change() {
    chk_fn_running = 1;
    try {
        var c1 = document.getElementsByName('dept_code'); //[0].selectedIndex
        //var c2 = document.querySelectorAll("#viw_loc > table > tbody")
        //c2.forEach(e => e.addEventListener("click", injectLinks));
        if (c1.length > 0) {
            const activities = c1[0];
            console.log(`Select el: ${c1[0]}`);
            activities.addEventListener('change', (e) => {
                console.log(`e.target.value = ${ e.target.value }`);
                //console.log(`activities.options[activities.selectedIndex].value = ${ activities.options[activities.selectedIndex].value }`);
                injectLinks();
            });
            //var on_chg = ddl.getAttribute('onchange');
            //ddl.setAttribute('onchange', on_chg + "; console.info('Val chagenge!'); injectLinks();");
            //interval1 = setInterval(linkify_Subjects, 500);
        }
    }
    catch(e) {console.warn(e);}
}

