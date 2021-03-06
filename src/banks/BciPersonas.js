// Requirements
var phantom = require ('../async/phantom');

// Config
var config = {
	loginUrl: 'https://bciimg.bci.cl/sitioseguro/login/login_personas_act.html',
	balanceUrl: 'https://www.bci.cl/cl/bci/aplicaciones/menu/vistas/inicio/miBanco.jsf'
};

// Local variables
var ph = null;
var page = null;

// Local functions
var check = () =>
{
	if (ph == null)
		throw Error ("Please log in first");
};
var dispose = () =>
{
	if (ph == null)
		return;

	ph.exit ();
	ph = null;
	page = null;
};

// Methods
module.exports =
{
	login: async (username, password) =>
	{
		dispose ();
		ph = await phantom.createAsync ();
		page = await ph.createPageAsync ();
		await page.openAsync (config.loginUrl);
		await page.evaluateAsync (data =>
		{
			$('#rut_aux')
				.val (data.username)
				.blur ();
			$('#clave').val (data.password);
			$('#frm').submit ();
		}, { username: username, password: password });
		await page.waitLoad ();
	},
	getAccounts: async () =>
	{
		check ();
		await page.openAsync (config.balanceUrl);
		await page.waitLoad ();
		var accounts = await page.evaluateAsync (() =>
			jQuery.map (
				jQuery('option'),
				x => jQuery(x).val()));
		return accounts.map (x => ({ id: x, name: x }));
	},
	getBalance: async (id) =>
	{
		check ();
		await page.openAsync (config.balanceUrl);
		await page.waitLoad ();
		await page.evaluateAsync (id =>
			jQuery ('option')
				.filter (x => jQuery (x).val () == id)
				.attr ('selected', true),
			id);
		var balance = await page.evaluateAsync (() =>
			jQuery ('.montos strong').first().text());
		return parseInt (balance
			.substring (2)
			.replace ('.', ''));
	},
	dispose: dispose
};
