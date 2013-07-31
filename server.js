var http = require('http'),
	fs = require('fs'),
	url = require('url'),
	parseURL = url.parse,
	path = require('path'),
	routes = [
		{ u:/^\/index/i, a:'index' },
		{ u:/^\/edit/i, a:'edit' },
		{ u:/^\/static/i, a:'static' },
		{ u:/^\/images/i, a:'static'}
	],
  tempStorage = {
    'topic1': {
      'name': 'Mobile device',
      'slides': {
        'Slide: t1s1': 'topic1 slide1',
        'Slide: t2s2': 'topic1 slide2'
      }
    },
    'topic2': {
      'name': 'Human computer interaction',
      'slides': {
        'Slide: t2s1': 'topic2 slide1',
        'Slide: t2s2': 'topic2 slide2',
        'Slide: t2s3': 'topic2 slide3'
      }
    }
  };

var server = http.createServer(function(req, res) {
	try {
		var opt = urlMatcher(req.url);
		if (opt) {
			handlers[opt.a](req, res, opt.q);
		} else {
			handlers['404'](req, res);
		}
	} catch (e) {
		handlers['500'](req, res, e);
	}
}).listen(8080);

function urlMatcher(u) {
  var pUrl = parseURL(u),
	    pn = pUrl.pathname,
      query = pUrl.query;
	for (var i = 0, len = routes.length; i < len; i++) {
		if (routes[i].u.exec(pn)) return { 'a':routes[i].a, 'q':query };
	}
}

var handlers = {
	'404': function(req, res) {
		res.writeHead(400, 'text/html');
		res.end('Page not found.');
	},
	'500': function(req, res, e) {
		res.writeHead(500, 'text/html');
		res.end('Server Error: ' + e);
	},
	'tempCache': {},
	'index': function(req, res, query) {
		var fn = path.join(__dirname, 'index.htm');
    res.slides = '<ul>';
    for (var key in tempStorage) {
      res.slides += '<li><a href="edit/?_id=' + key + '">' + tempStorage[key].name + '</a></li>';
    }
    res.slides += '</ul>';
    res.nums = '123345';
		return this.render(req, res, fn, true);
	},
	'edit': function(req, res, query) {
		var fn = path.join(__dirname, 'edit.htm'),
        slides = tempStorage.topic2.slides;
    res.ppt = '<ul>';
    for (var key in slides) {
      res.ppt += '<li data="' + key + '">' + key + '</li>';
    }
    res.ppt += '</ul>';
		return this.render(req, res, fn, true);
	},
	'static': function(req, res) {
		var fn = path.join(__dirname, parseURL(req.url).pathname),
        exists = fs.existsSync(fn);

    if (!exists) {
      this['404'](req, res);
      return;
    }
    
    var t = this.tempCache[fn],
        lastMod = fs.statSync(fn).mtime.getTime(), 
        out, ext;
    
    if (t && t.lastMod === lastMod) {
      out = t.out;
      ext = t.ext;
    } else {
      console.log('Read static file to cache: ' + fn);
      ext = path.extname(fn);
      ext = ext ? ext.slice(1) : 'html';
      out = fs.readFileSync(fn, 'binary');
      this.tempCache[fn] = {
        'out': out,
        'ext': ext,
        'lastMod': lastMod
      };
    }

    res.writeHead(200, contentTypes[ext] || 'text/html');
    res.write(out, 'binary');
    res.end();
	},
	'render': function(req, res, fn, inVar) {
    var exists = fs.existsSync(fn);
    if (!exists) {
      this['404'](req, res);
      return;
    }

		var t = this.tempCache[fn],
        lastMod = fs.statSync(fn).mtime.getTime(),
        out;
    
		if (t && t.lastMod === lastMod) {
      out = t.out;
    }	else {
      console.log('Read html file to cache: ' + fn);
			out = fs.readFileSync(fn, 'utf-8');
			this.tempCache[fn] = {
        'out': out,
        'ext': 'html',
        'lastMod': lastMod
      };
		} 

		//replace the variable
    if (inVar === undefined) inVar = true;
    if (inVar) {
  		out = out.replace(/<\?snp[\s]*\$([\w-])+[\s]*\?>/g, function(m) {
  			var v = /\$([\w-])+/.exec(m)[0].substring(1);
        if (res[v] === undefined) throw new Error('500: Variable not found.');
  			return res[v];
  		});
    }

		res.writeHead(200, 'text/html');
		res.end(out);
	}
}

var contentTypes = {
  "aiff": "audio/x-aiff",
  "arj": "application/x-arj-compressed",
  "asf": "video/x-ms-asf",
  "asx": "video/x-ms-asx",
  "au": "audio/ulaw",
  "avi": "video/x-msvideo",
  "bcpio": "application/x-bcpio",
  "ccad": "application/clariscad",
  "cod": "application/vnd.rim.cod",
  "com": "application/x-msdos-program",
  "cpio": "application/x-cpio",
  "cpt": "application/mac-compactpro",
  "csh": "application/x-csh",
  "css": "text/css",
  "deb": "application/x-debian-package",
  "dl": "video/dl",
  "doc": "application/msword",
  "drw": "application/drafting",
  "dvi": "application/x-dvi",
  "dwg": "application/acad",
  "dxf": "application/dxf",
  "dxr": "application/x-director",
  "etx": "text/x-setext",
  "ez": "application/andrew-inset",
  "fli": "video/x-fli",
  "flv": "video/x-flv",
  "gif": "image/gif",
  "gl": "video/gl",
  "gtar": "application/x-gtar",
  "gz": "application/x-gzip",
  "hdf": "application/x-hdf",
  "hqx": "application/mac-binhex40",
  "html": "text/html",
  "ice": "x-conference/x-cooltalk",
  "ief": "image/ief",
  "igs": "model/iges",
  "ips": "application/x-ipscript",
  "ipx": "application/x-ipix",
  "jad": "text/vnd.sun.j2me.app-descriptor",
  "jar": "application/java-archive",
  "jpeg": "image/jpeg",
  "jpg": "image/jpeg",
  "js": "text/javascript",
  "json": "application/json",
  "latex": "application/x-latex",
  "lsp": "application/x-lisp",
  "lzh": "application/octet-stream",
  "m": "text/plain",
  "m3u": "audio/x-mpegurl",
  "man": "application/x-troff-man",
  "me": "application/x-troff-me",
  "midi": "audio/midi",
  "mif": "application/x-mif",
  "mime": "www/mime",
  "movie": "video/x-sgi-movie",
  "mp4": "video/mp4",
  "mpg": "video/mpeg",
  "mpga": "audio/mpeg",
  "ms": "application/x-troff-ms",
  "nc": "application/x-netcdf",
  "oda": "application/oda",
  "ogm": "application/ogg",
  "pbm": "image/x-portable-bitmap",
  "pdf": "application/pdf",
  "pgm": "image/x-portable-graymap",
  "pgn": "application/x-chess-pgn",
  "pgp": "application/pgp",
  "pm": "application/x-perl",
  "png": "image/png",
  "pnm": "image/x-portable-anymap",
  "ppm": "image/x-portable-pixmap",
  "ppz": "application/vnd.ms-powerpoint",
  "pre": "application/x-freelance",
  "prt": "application/pro_eng",
  "ps": "application/postscript",
  "qt": "video/quicktime",
  "ra": "audio/x-realaudio",
  "rar": "application/x-rar-compressed",
  "ras": "image/x-cmu-raster",
  "rgb": "image/x-rgb",
  "rm": "audio/x-pn-realaudio",
  "rpm": "audio/x-pn-realaudio-plugin",
  "rtf": "text/rtf",
  "rtx": "text/richtext",
  "scm": "application/x-lotusscreencam",
  "set": "application/set",
  "sgml": "text/sgml",
  "sh": "application/x-sh",
  "shar": "application/x-shar",
  "silo": "model/mesh",
  "sit": "application/x-stuffit",
  "skt": "application/x-koan",
  "smil": "application/smil",
  "snd": "audio/basic",
  "sol": "application/solids",
  "spl": "application/x-futuresplash",
  "src": "application/x-wais-source",
  "stl": "application/SLA",
  "stp": "application/STEP",
  "sv4cpio": "application/x-sv4cpio",
  "sv4crc": "application/x-sv4crc",
  "svg": "image/svg+xml",
  "swf": "application/x-shockwave-flash",
  "tar": "application/x-tar",
  "tcl": "application/x-tcl",
  "tex": "application/x-tex",
  "texinfo": "application/x-texinfo",
  "tgz": "application/x-tar-gz",
  "tiff": "image/tiff",
  "tr": "application/x-troff",
  "tsi": "audio/TSP-audio",
  "tsp": "application/dsptype",
  "tsv": "text/tab-separated-values",
  "txt": "text/plain",
  "unv": "application/i-deas",
  "ustar": "application/x-ustar",
  "vcd": "application/x-cdlink",
  "vda": "application/vda",
  "vivo": "video/vnd.vivo",
  "vrm": "x-world/x-vrml",
  "wav": "audio/x-wav",
  "wax": "audio/x-ms-wax",
  "wma": "audio/x-ms-wma",
  "wmv": "video/x-ms-wmv",
  "wmx": "video/x-ms-wmx",
  "wrl": "model/vrml",
  "wvx": "video/x-ms-wvx",
  "xbm": "image/x-xbitmap",
  "xlw": "application/vnd.ms-excel",
  "xml": "text/xml",
  "xpm": "image/x-xpixmap",
  "xwd": "image/x-xwindowdump",
  "xyz": "chemical/x-pdb",
  "zip": "application/zip"
};
