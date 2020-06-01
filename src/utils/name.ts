export const base = [
  'Alden',
  'Alec',
  'Anton',
  'Arden',
  'Arlen',
  'Armand',
  'Arron',
  'Augustus',
  'Avery',
  'Benedict',
  'Bennett',
  'Branden',
  'Brendon',
  'Britt',
  'Broderick',
  'Carter',
  'Chadwick',
  'Chas',
  'Chet',
  'Colby',
  'Cole',
  'Cordell',
  'Dalton',
  'Damien',
  'Dante',
  'Darell',
  'Darius',
  'Darron',
  'Darwin',
  'Dewitt',
  'Diego',
  'Dillon',
  'Dirk',
  'Domenic',
  'Donovan',
  'Dorian',
  'Dorsey',
  'Edison',
  'Elden',
  'Elvin',
  'Erich',
  'Galen',
  'Garret',
  'Gaston',
  'Gavin',
  'German',
  'Graham',
  'Hal',
  'Hank',
  'Harlan',
  'Hayden',
  'Herschel',
  'Hoyt',
  'Hunter',
  'Isaias',
  'Issac',
  'Jacinto',
  'Jarred',
  'Jonas',
  'Kendrick',
  'Keneth',
  'Kennith',
  'Keven',
  'Leif',
  'Lenard',
  'Lincoln',
  'Linwood',
  'Lucius',
  'Lynwood',
  'Malcolm',
  'Malik',
  'Maxwell',
  'McKinley',
  'Merlin',
  'Merrill',
  'Michal',
  'Monty',
  'Newton',
  'Nolan',
  'Porter',
  'Quinton',
  'Raphael',
  'Reid',
  'Rory',
  'Scotty',
  'Shad',
  'Stanton',
  'Stefan',
  'Thaddeus',
  'Tobias',
  'Trenton',
  'Vance',
  'Walker',
  'Walton',
  'Weldon',
  'Wes',
  'Weston',
  'Willian',
  'Winford',
  'Wyatt',
];

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// name_generator.js
// written and released to the public domain by drow <drow@bin.sh>
// http://creativecommons.org/publicdomain/zero/1.0/

var name_set: any = { base };
var chain_cache: any = {};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// generator function

export function generate_name(type: any) {
  var chain;
  if ((chain = markov_chain(type))) {
    return markov_name(chain);
  }
  return '';
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// generate multiple

// function name_list(type: any, n_of: number) {
//   var list = [];

//   var i;
//   for (i = 0; i < n_of; i++) {
//     list.push(generate_name(type));
//   }
//   return list;
// }

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// get markov chain by type

function markov_chain(type: string | number) {
  var chain;
  if ((chain = chain_cache[type])) {
    return chain;
  } else {
    var list;
    if ((list = name_set[type])) {
      var chain2;
      if ((chain2 = construct_chain(list))) {
        chain_cache[type] = chain2;
        return chain2;
      }
    }
  }
  return false;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// construct markov chain from list of names

function construct_chain(list: string | any[]) {
  var chain = {};

  var i;
  for (i = 0; i < list.length; i++) {
    var names = list[i].split(/\s+/);
    chain = incr_chain(chain, 'parts', names.length);

    var j;
    for (j = 0; j < names.length; j++) {
      var name = names[j];
      chain = incr_chain(chain, 'name_len', name.length);

      var c = name.substr(0, 1);
      chain = incr_chain(chain, 'initial', c);

      var string = name.substr(1);
      var last_c = c;

      while (string.length > 0) {
        var c2 = string.substr(0, 1);
        chain = incr_chain(chain, last_c, c2);

        string = string.substr(1);
        last_c = c2;
      }
    }
  }
  return scale_chain(chain);
}
function incr_chain(
  chain: { [x: string]: { [x: string]: number } },
  key: string,
  token: string | number,
) {
  if (chain[key]) {
    if (chain[key][token]) {
      chain[key][token]++;
    } else {
      chain[key][token] = 1;
    }
  } else {
    chain[key] = {};
    chain[key][token] = 1;
  }
  return chain;
}
function scale_chain(chain: any) {
  var table_len = {} as any;

  var key;
  for (key in chain) {
    table_len[key] = 0;

    var token;
    for (token in chain[key]) {
      var count = chain[key][token];
      var weighted = Math.floor(Math.pow(count, 1.3));

      chain[key][token] = weighted;
      table_len[key] += weighted;
    }
  }
  chain['table_len'] = table_len;
  return chain;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// construct name from markov chain

function markov_name(chain: any) {
  var parts = select_link(chain, 'parts');
  var names = [];

  var i;
  //@ts-ignore
  for (i = 0; i < parts; i++) {
    var name_len = select_link(chain, 'name_len');
    var c = select_link(chain, 'initial');
    var name = c;
    var last_c = c;
    //@ts-ignore
    while (name.length < name_len) {
      c = select_link(chain, last_c);
      name += c;
      last_c = c;
    }
    names.push(name);
  }
  return names.join(' ');
}
function select_link(chain: any, key: any) {
  var len = chain['table_len'][key];
  var idx = Math.floor(Math.random() * len);

  var t = 0;
  for (var token in chain[key]) {
    t += chain[key][token];
    if (idx < t) {
      return token;
    }
  }
  return '-';
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
