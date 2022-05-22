function submitForm(e, url) {
    e.preventDefault();

    // FOR IF WE NEED IMAGES UPLOADED
    // (it looks like we dont' have to)
    // if (document.getElementById('image').files.length > 0) {
    //     let reader = new FileReader()
    //     reader.readAsBinaryString(document.getElementById('image').files[0])
    //     reader.onload = () => { do_fetch(reader.result) }
    // } else { do_fetch('') }
    // return false
    let form = document.getElementsByTagName('form')[0]
    let nodes = form.getElementsByTagName('input')
    let body = {}
    for (let i = 0; i < nodes.length; i++) {
        if(nodes[i].type != 'submit') {
            body[nodes[i].name] = nodes[i].value
        }
    }

    fetch(url, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    }).then(response => response.json())
    .then(json => {
        console.log(json)
        if (json['redirect']) { window.location.replace(json['redirect']); }
        if (json['error']) { document.getElementById('error').innerText = json['error'] }
        if (json['query']) { 
            let doc = document.getElementById('query_results')
            while(doc.children.length > 0) { doc.children[0].remove() }
            let ele = document.createElement('tr')
            ele.innerText = 'No result is retrieved. Please query again'
            if (json['query'].length == 0) { document.getElementById('query_results').appendChild(ele) }
            render_table('query_results', json['query']) }
    })
    return false;
}