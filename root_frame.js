(()=>{

    const call_child =(func_name, args)=>{
        aut_editor.contentWindow.postMessage({
            type: 'CALL_IFRAME_FUNC',
            funcName: func_name,  // 要调用的函数名
            args:  args// 参数
        }, '*');
    }
    const source = document.body.innerText;
    window.send_source =()=>{
        call_child("setSource", [source]);
        setTimeout(()=>{
                window.$syncer.getAccounts((function (t) {
                    call_child("setAccounts", t);
             }));
        }, 100);
    }
    const params = function (t) {
        var e = {};
        return e.title = t.title, t.content ? e.content = t.content : t.markdown && (e.markdown = t.content), t.thumb && (e.thumb = t.thumb), e.desc = t.desc ? t.desc : t.content.substring(0, 20), e
    }
    let publish_status = 0;
    window.public_article =(art_tit, art_img, html_content, art_accounts)=>{
        if(!art_tit || publish_status !== 0){
            return;
        }
        if(window.confirm("即将发布文章："+art_tit)) {

            publish_status = 1;
            window.$syncer.addTask({
                post: params({
                    title: art_tit,
                    content: html_content,
                    markdown: null,
                    thumb: art_img,
                    desc: html_content.substring(0, 120)
                }),
                accounts: art_accounts
            }, (function (e) {
                taskStatus = e;
                call_child("setTaskStatus", taskStatus.accounts);
                publish_status = 0
            }), (function () {

            }))
        }
    }

    window.addEventListener('message', (e) => {
      if (e.data.type === 'CALL_IFRAME_FUNC') {
        const funcName = e.data.funcName;
        const args = e.data.args || [];

        // 执行你定义的函数
        if (typeof window[funcName] === 'function') {
          window[funcName](...args);
        }
      }
    });
})()
