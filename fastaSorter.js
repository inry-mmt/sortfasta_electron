const sort = (fastaData, nwkData) => {
  const fastaList = fasta_tolist(fastaData);
  const newickList = newick_tolist(nwkData);

  const sortedFastaList = [];
  const unmatchedList = [];

  for(let fasta of fastaList){
    let found = false;
    for(let i = 0; i < newickList.length; i++){
      if(fasta.name === newickList[i]){
        sortedFastaList[i] = {
          name: fasta.name,
          value:fasta.value,
        };
        found = true;
        break;
      }
    }
    if(!found){
      unmatchedList.push({
        name: fasta.name,
        value:fasta.value,
      });
    }
  }

  if(unmatchedList.length > 0){
    sortedFastaList.push.apply(unmatchedList);
  }

  const sortedFastaData = sortedFastaList
                          .map(o => '>' + o.name + '\n' + o.value)
                          .join('\n');
  return sortedFastaData;
}

const newick_tolist = (data) => {
  // シングルクオート2連をエスケープ
  data = data.replace('\'\'', '<__single_quote__>');

  // 1文字ずつ読みながら
  let buff = '';
  const state = {
    innerQuote: false
  };

  for(let chara of data){
    if(state.innerQuote){
      switch(chara){
        case '\'':
          state.innerQuote = false;
          break;
        case '(':
          buff += '<__forward_parenthesis__>';
          break;
        case ')':
          buff += '<__reverse_parenthesis__>';
          break;
        case ':':
          buff += '<__colon__>';
          break;
        case ';':
          buff += '<__semicolon__>';
          break;
        case ',':
          buff += '<__comma__>';
          break;
        default:
          buff += chara;
      }
    } else {
      switch(chara){
        case '\'':
          state.innerQuote = true;
          break;
        default:
          buff += chara;
      }
    }
  }
  const escapedData = buff;
  const nameList = escapedData
                   .replace(/([^\(\):,]+):[^\(\),]+/g, '$1')
                   .replace(/[();]/g, '')
                   .replace(/\s$/, '')
                   .split(',')
                   .map(n => {
                     n = n.replace(/<__forward_parenthesis__>/, '(')
                          .replace(/<__reverse_parenthesis__>/, ')')
                          .replace(/<__colon__>/, ':')
                          .replace(/<__semicolon__>/, ';')
                          .replace(/<__comma__>/, ',');

                     return n;
                   });
  return nameList;
}

const fasta_tolist = (data) => {
  data = data.replace(/\r\n/g, '\n');
  lines = data.split('\n');

  const fastaList = [];
  for(let i = 0; i < lines.length; i += 2){
    fastaList.push({
      name: lines[i].replace(/^>/, ''),
      value: lines[i + 1],
    });
  }
  return fastaList;
}

module.exports = {
  sort: sort,
  newick: {
    tolist: newick_tolist,
  },
  fasta: {
    tolist: fasta_tolist,
  },
};
