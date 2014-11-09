var argv = require('yargs').argv;

if(argv.logic){
	console.log('logic is ' + argv.logic);
}else{
	console.log('no logic param passed');
}
