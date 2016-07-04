(function () {
    var test_dom = document.createElement('div');
    var parse_regexp = new RegExp('\\[+[a-zA-Z_.0-9\\[\\]]*\\]', 'g');
    var to_dom_div = document.createElement('div');
    function _toDom(html) {
        to_dom_div.innerHTML = html;
        if (to_dom_div.children.length > 1) {
            return to_dom_div.children;
        } else if (to_dom_div.children.length > 0) {
            return to_dom_div.children[0];
        }
    }
    function _template(html, obj, toDom) {
        var ans = html.match(parse_regexp)
        var prp, orig, e, value;
        if (!ans)
            return toDom ? _toDom(html) : html;
        for (var i = 0, l = ans.length, len; i < l; i++) {
            orig = ans[i];
            prp = orig.substr(1);
            prp = prp.substring(0, prp.length - 1)
            value = obj[prp]
            /*try {
             value = eval("obj." + prp);
             } catch (e) {
             value = ""
             }*/
            if (value == undefined || !value)
                value = ""
            html = html.replace(orig, value)
        }
        return toDom ? _toDom(html) : html;
    }

    /*-----------------------*/

    var create_regexp = {
        node: /^(\w+)?/gi,
        class: /(\.[\w\-^\.]+)/gi,
        id: /\#([\w\-]+)?/gi,
        attr: /\[(.[^\]\[]*)\]/gi
    };

    /**
     * 
     * @param {type} String
     * @param {type} String
     * @returns HTMLElement
     */
    function _create(_s, content) {
        var n = _s.match(create_regexp.node)
        var c = _s.match(create_regexp.class);
        var id = _s.match(create_regexp.id);
        var attr = _s.match(create_regexp.attr), a;
        n = n && n != '' ? n[0].toLowerCase() : "div";
        c = c ? c[0].replace(/\./gi, ' ').trim() : '';
        id = id ? id[0].substr() : '';
        attr = attr || [];
        var dom = document.createElement(n);
        if (c != '')
            dom.className = c;
        if (id != '')
            dom.id = id;
        while (attr.length > 0) {
            a = attr.pop();
            a = a.substring(1, a.length - 2).replace('\"', '').replace('\'', '').split('=');
            if (a[0] == 'style') {
                dom.style.cssText = a[1];
            } else {
                dom.setAttribute(a[0], a[1]);
            }
        }
        if (typeof (content) == "string") {
            if (n == 'input' || n == 'textarea' || n == 'select')
                dom.value = content;
            else
                dom.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            dom.appendChild(content)
        } else if (content instanceof Array) {

        }
        return dom;
    }

    getElements = function (_c, inWhere) {
        inWhere = inWhere || document;
        return inWhere.querySelectorAll(_c);
    }


    var css_equiv = {};
    function convertCssToStyle(v) {
        if (css_equiv[v])
            return css_equiv[v];
        var str = '', i = 0, l = v.length, t_next = false;
        while (i < l) {
            if (v.substr(i, 1) == '-') {
                if (i > 0)
                    t_next = true;
            } else if (t_next) {
                str += v.substr(i, 1).toUpperCase();
                t_next = false;
            } else {
                str += v.substr(i, 1);
            }

            i++;
        }
        css_equiv[v] = str;
        return str;
    }

    /*--------------------------------------------------------------------------------------------*/

    if (test_dom['classList']) {
        HTMLElement.prototype.removeClass = function (c) {
            this.classList.remove(c);
            return this;
        }
        HTMLElement.prototype.hasClass = function (c) {
            return this.classList.contains(c);
        }
        HTMLElement.prototype.addClass = function (c) {
            this.classList.add(c);
            return this;
        }
    } else {
        HTMLElement.prototype.addClass = function (c) {
            var clases = this.className.trim();
            clases = clases != '' ? clases.split(' ') : [];
            var add = c.split(' ');
            add.forEach(function (e, i) {
                if (clases.indexOf(e) == -1) {
                    clases.push(e)
                }
            })
            this.className = clases.join(' ')
            return this;
        }
        HTMLElement.prototype.hasClass = function (t, c) {
            var clases = this.className.trim();
            clases = clases != '' ? clases.split(' ') : [];
            return clases.indexOf(c) >= 0;
        }
        HTMLElement.prototype.removeClass = function (t, c) {
            var clases = this.className.trim().split(' '), i, c_list = c.split(' ');
            c_list.forEach(function (e) {
                i = clases.indexOf(c);
                if (i >= 0) {
                    clases.splice(i, 1)
                }
            })
            this.className = clases.join(' ');
            return t;
        }
    }
    ////////////// Transform, transition
    var css_prefixes = ["webkit", "Moz", "Ms"], tt = '', prefix = '';
    for (tt in css_prefixes) {
        if (test_dom.style[css_prefixes[tt] + "Transform"] == '') {
            prefix = css_prefixes[tt];
        }
    }
    var prefix_transform = prefix != '' ? prefix + "Transform" : "transform";
    var prefix_transform_css = prefix != '' ? "-" + prefix.toLowerCase() + "-transform" : "transform";
    var prefix_transition = prefix != '' ? prefix + "Transition" : "transition";
    var prefix_transition_css = prefix != '' ? "-" + prefix.toLowerCase() + "-transition" : "transition";

    HTMLElement.prototype.transform = function (value) {
        if (!value) {
            return this.style[prefix_transform];
        }
        this.style[prefix_transform] = value;
        return this;
    }
    HTMLElement.prototype.transition = function (value) {
        if (!value) {
            return this.style[prefix_transition];
        }
        this.style[prefix_transition] = value;
        return this;
    }


    HTMLElement.prototype.css = function (prop, value) {
        var css_prop = convertCssToStyle(prop);
        if (value == undefined) {
            return this.style[css_prop];
        } else {
            this.style[css_prop] = value;
        }
        return this;
    }

    /*--------------------------------------------------------------------*/

    HTMLElement.prototype.on = function (t, fn) {
        this.addEventListener(t, fn)
        return this;
    }
    HTMLElement.prototype.one = function (t, fn) {
        this.addEventListener(t, function () {
            this.off(t, arguments.callee);
            fn.apply(this, arguments)
        })
        return this;
    }
    HTMLElement.prototype.off = function (t, fn) {
        this.removeEventListener(t, fn)
        return this;
    }

    /*----------------------------------------------------------------------*/


    HTMLElement.prototype.width = function (value) {
        if (value) {
            this.css('width', value)
            return this;
        } else {
            return this.clientWidth;
        }
    }
    HTMLElement.prototype.height = function (value) {
        if (value) {
            this.css('height', value)
            return this;
        } else {
            return this.clientHeight;
        }
    }


    HTMLElement.prototype.index = function () {
        if (this.parentElement) {
            var th = this;
            var ch = this.parentElement.children
            var idx = -1
            ch.each(function (elm, i) {
                if (elm == th) {
                    idx = i
                }
            })
            return idx;
        }
        return -1;
    }

    HTMLElement.prototype.find = function (selector) {
        return getElements(selector, this)
    }
    HTMLElement.prototype.data = function (prop, value) {
        if (arguments.length > 1) {
            if (value == null) {
                this.removeAttribute('data-' + prop)
            } else {
                this.setAttribute('data-' + prop, value)
            }
        } else {
            return this.getAttribute('data-' + prop);
        }
    }
    HTMLElement.prototype.attr = HTMLElement.prototype.prop = function (p, v) {
        if (arguments.length > 1) {
            if (v == null) {
                this.removeAttribute(p)
            } else {
                this.setAttribute(p, v)
            }
        } else {
            return this.getAttribute(p);
        }
    }
    HTMLElement.prototype.html = function (html) {
        if (html) {
            this.innerHTML = html;
            return this;
        } else {
            return this.innerHTML;
        }
    }
    if (!HTMLElement.prototype.remove) {
        HTMLElement.prototype.remove = function () {
            return this.parentNode.removeChild(this)
        }
    }

    HTMLElement.prototype.formData = function () {
        var elms = this.find('input, select, textarea');
        var ret_data = {};
        elms.each(function (elm) {
            ret_data[elm.prop('name')] = elm.value
        })
        return ret_data;
    }

    /*------------------------------------------------------------------------*/

    if (window['HTMLCollection']) {
        HTMLCollection.prototype.one = function (type, fn) {
            for (var i = 0; i < this.length; i += 1) {
                this[i].one(type, fn);
            }
            return this;
        }
        HTMLCollection.prototype.on = function (type, fn) {
            for (var i = 0; i < this.length; i += 1) {
                this[i].addEventListener(type, fn);
            }
            return this;
        }
        HTMLCollection.prototype.off = function (type, fn) {
            for (var i = 0; i < this.length; i += 1) {
                this[i].removeEventListener(type, fn);
            }
            return this;
        }
        HTMLCollection.prototype.addClass = function (className) {
            for (var i = 0; i < this.length; i += 1) {
                this[i].addClass(className);
            }
            return this;
        }
        HTMLCollection.prototype.removeClass = function (className) {
            for (var i = 0; i < this.length; i += 1) {
                this[i].removeClass(className);
            }
            return this;
        }
        HTMLCollection.prototype.attr = function (prp, value) {
            for (var i = 0; i < this.length; i += 1) {
                this[i].attr(prp, value);
            }
            return this;
        }
        HTMLCollection.prototype.transform = function (value) {
            for (var i = 0; i < this.length; i += 1) {
                this[i].transform(value);
            }
            return this;
        }
        HTMLCollection.prototype.transition = function (value) {
            for (var i = 0; i < this.length; i += 1) {
                this[i].transition(value);
            }
            return this;
        }
        HTMLCollection.prototype.css = function (prop, value) {
            for (var i = 0; i < this.length; i += 1) {
                this[i].css(prop, value);
            }
            return this;
        }
        HTMLCollection.prototype.html = function (html) {

            if (html) {
                for (var i = 0; i < this.length; i += 1) {
                    this[i].html(html);
                }
                return this;
            } else {
                var ret = [];
                for (var i = 0; i < this.length; i += 1) {
                    ret.push(this[i].innerHTML);
                }
                return ret;
            }

        }
        HTMLCollection.prototype.each = function (callback) {
            for (var i = 0; i < this.length; i += 1) {
                callback.apply(this, [this[i], i]);
            }
        }
    }


    if (window['NodeList']) {
        NodeList.prototype.one = HTMLCollection.prototype.one;
        NodeList.prototype.on = HTMLCollection.prototype.on;
        NodeList.prototype.off = HTMLCollection.prototype.off;
        NodeList.prototype.addClass = HTMLCollection.prototype.addClass;
        NodeList.prototype.removeClass = HTMLCollection.prototype.removeClass;
        NodeList.prototype.attr = HTMLCollection.prototype.attr;
        NodeList.prototype.css = HTMLCollection.prototype.css;
        NodeList.prototype.each = HTMLCollection.prototype.each;
        NodeList.prototype.html = HTMLCollection.prototype.html;
        NodeList.prototype.transform = HTMLCollection.prototype.transform;
        NodeList.prototype.transition = HTMLCollection.prototype.transition;
    }

    function _vq(selector) {
        return getElements(selector);
    }
    _vq.create = _create;
    _vq.template = _template;
    _vq.css = {
        prefix_transform: prefix_transform,
        prefix_transform_css: prefix_transform_css,
        prefix_transition: prefix_transition,
        prefix_transition_css: prefix_transition_css,
    }
    var nav = navigator.userAgent || navigator.vendor || window.opera;
    _vq.browser = {
        is_mobile: /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(nav) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(nav.substr(0, 4)),
        is_tablet: /(tablet|ipad|android)+(?!mobile)./i.test(nav)
    }

    /*----------------------------------------------------------------------------------------------------------*/
    /*----------------------------------------------------------------------------------------------------------*/

    function generatePostData(o, from, r) {
        var ret = r || [];
        from = from || "";
        if (from != "") {
            for (var s in o) {
                if (typeof (o[s]) == 'object' || typeof (o[s]) == 'array') {
                    generatePostData(o[s], from + '[' + s + "]", ret)
                } else {
                    ret.push(from + '[' + s + "]=" + o[s] + "");
                }
            }
        } else {
            for (var s in o) {
                if (typeof (o[s]) == 'object' || typeof (o[s]) == 'array') {
                    generatePostData(o[s], from + s, ret)
                } else {
                    ret.push(from + s + "=" + o[s] + "");
                }
            }
        }

        return ret.join('&');
    }

    _vq.ajax = function (_p) {
        var methods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']
        var xhr = new XMLHttpRequest();
        if (_p.method)
            _p.method = _p.method.toUpperCase();
        if (methods.indexOf(_p.method) == -1) {
            _p.method = "GET";
        }

        xhr.addEventListener('readystatechange', function (evt) {
            if (evt.target.readyState == 4) {
                if (evt.target.status == '200') {
                    if (_p.success) {
                        _p.success(evt.target.responseText, xhr);
                    }
                } else {
                    if (_p.error) {
                        _p.error(evt.target.responseText, xhr);
                    }

                }
            }
        }, false);

        if (typeof (_p.data) == 'object') {
            var get_vars = (_p.method == 'GET' ? "?" + generatePostData(_p.data) : "");
            xhr.open(_p.method, _p.url + get_vars);
            if (_p.method == "POST") {
                xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                xhr.send(generatePostData(_p.data));
            } else if (_p.method == "PUT" || _p.method == "PATCH") {
                xhr.setRequestHeader('Content-Type', 'text/plain');
                xhr.send(JSON.stringify(_p.data));
            } else {
                xhr.send();
            }

        } else {
            var get_vars = (_p.method != 'POST' ? "?" + _p.data : "");
            xhr.open(_p.method, _p.url + get_vars);
            xhr.setRequestHeader("Content-Type", "text/plain");
            if (_p.method != "GET") {
                xhr.send(_p.data);
            } else {
                xhr.send();
            }
        }
        return xhr;
    }

    /*----------------------------------------------------------------------------------------------------------*/
    /*----------------------------------------------------------------------------------------------------------*/


    window['$'] = _vq;

})();