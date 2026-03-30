
(()=>{

    try {
        var fresh_account = document.getElementById("fresh_account");
        var publish_btn = document.getElementById("publish_btn");
        const edit_el = document.getElementById("edit_el");
        const send_btn = document.getElementById("send_btn");
        const msg_in = document.getElementById("msg_in");
        // const test_el = document.getElementById("test");
        // test_el.onclick =()=>{
        //     window.call_parent('open', ["https://mp.weixin.qq.com/cgi-bin/appmsg?t=media/appmsg_edit&action=edit&type=77&appmsgid=100001690&token=1733488692&lang=zh_CN&timestamp=1774844666847"]);
        // }

        const art_tips =(msg)=>{
            if(edit_el) {
                edit_el.innerText = msg;
                if (msg === "创 作") {
                    edit_el.style.background = "#07c160";
                } else {
                    edit_el.style.background = "gray";
                }
            }
            return msg;
        }
        let choose_accounts = [];
        let messages = [];
        window.setSource = (source) => {
            if(choose_accounts.length > 0){
                art_tips("创 作");
            }
            messages.push({
                role: "system", content: `你是一个专业的 Markdown 编辑器助手，请用简洁中文回答。
        - 所有回复内容均严格遵循markdown格式
        - 你的回答请参考如下内容(回答内容应遵循：原创、无抄袭、符合中国法律法规)：
        `
                    + source
            })
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
        window.call_parent = (func_name, params) => {
            return window.parent.postMessage({
                type: 'CALL_IFRAME_FUNC',
                funcName: func_name,  // 要调用的函数名
                args: params // 参数
            }, '*')
        }


        window.setAccounts = (...accounts) => {
            if(messages.length > 0){
                art_tips("创 作");
            }
            var accounts_el = document.getElementById("accounts");
            let acc_html = "";
            for (var i = 0; i < accounts.length; i++) {
                if (accounts[i].uid === "本地下载") {
                    continue;
                }
                acc_html += "<div class='one_account' ><img src='" + accounts[i].icon + "'><label id='tit_"+accounts[i].type+"'></label><a id='acc_"+accounts[i].type+"' href='javascript:void();'></a></div>";
                choose_accounts.push(accounts[i]);
            }
            accounts_el.innerHTML = acc_html;
        }
        window.setTaskStatus =(...taskStatus)=>{
            if(taskStatus){
                let done_accounts = [];
                for(var i=0;i<taskStatus.length;i++){
                    const task = taskStatus[i];
                    if(done_accounts.indexOf(task.type) > -1){
                        continue;
                    }
                    const msg = task.msg;
                    const title = task.title;
                    const status = task.status;
                    const acc_a = document.getElementById("acc_"+task.type);
                    const acc_tit = document.getElementById("tit_"+task.type);
                    if(acc_tit){
                        acc_tit.innerText = title;
                    }
                    if(status === "done"){
                        done_accounts.push(task.type);
                        acc_a.onclick =()=>{
                            window.call_parent('open', [task.editResp.draftLink]);
                        }
                        // acc_a.href = "javascript:window.call_parent('open','"+task.editResp.draftLink+"')";
                        acc_a.innerText = "查看草稿";
                    }else{
                        acc_a.innerText = msg;

                    }


                }
            }
        }

        let max_c = 3;
        let cur_c = 1;
        let timer = setInterval(()=>{
            if(choose_accounts.length === 0 || messages.length === 0){
                art_tips("加载内容中"+'.'.repeat(cur_c));
                if(cur_c < max_c) {
                    cur_c += 1
                }else{
                    cur_c = 1;
                }
                call_parent("send_source", []);
            }else{
                clearInterval(timer);
            }

        }, 5000);
        fresh_account.onclick = () => {
            call_parent("send_source", []);
        }
        let html_content = '';
        let art_tit = '';
        let art_img = '';
        // 初始化编辑器
        const editor = editormd("editor", {
            width: "unset",
            height: "unset",
            markdown: ``,
            watch: true,      // 开启实时预览
            toolbar: true,    // 显示工具栏
            htmlDecode: true  // 支持解析HTML
        });
        publish_btn.onclick = () => {
            if (choose_accounts.length === 0) {
                call_parent("send_source", []);
                alert("未正常加载账号，即将刷新");
                return;
            }
            if (choose_accounts.length > 0) {
                art_tit = editor.getMarkdown().split("\n")[0].replaceAll("#", "").trim();
                call_parent("public_article", [art_tit, art_img, html_content, choose_accounts]);
            }
        }

        send_btn.onclick =async () => {
            const msg_in = msg_in.value();
            const msg_box = await chat(msg_in, (content)=>{

            })
        }

        const edit = async () => {
            if (messages.length === 0 || choose_accounts.length === 0) {
                call_parent("send_source", []);
                alert("内容加载失败，自动重试中");
                return;
            }
            let tit = "";
            if (edit_el.innerText === art_tips("创作中。。")){
                return;
            }
            let tit_html = "";
            const msg_box = await chat(
                `写一篇美观的文章
            - 内容不可编造
            - 文章标题和内容应严格遵循：原创、无抄袭、符合中国法律法规
            - 直接输出markdown格式，但不要有"\`\`\`markdown"标识
            - 不设置任何跳转链接
            - 关键链接用直接明文显示
            - 文章描述完全模拟人工，适当俏皮，适当故意增加少量错别字
            - 输出完整文章内容，不要包含任何AI成分，比如:"本文完全根据已提供的内容撰写，无任何虚构或编造的成分。"
            `
                , (content) => {
                    editor.setMarkdown(content);
                    editor.cm.scrollTo(0, editor.cm.getScrollInfo().height);
                    const previewEl = editor.preview[0];

                    previewEl.scrollTop = previewEl.scrollHeight;
                    tit_html = previewEl.childNodes[0].childNodes[0];
                    if (!tit && previewEl.childNodes[0].childNodes.length > 0) {

                        art_tit = tit_html.innerText.trim();
                        tit = art_tit;
                        txt2img(art_tit).then((img_url) => {
                            art_img = img_url;
                            document.getElementById("art_img").src = art_img;
                        })
                    }
                    html_content = previewEl.innerHTML.replace(tit_html.outerHTML, "");
                });
            art_tips("创 作");
        }

        const tips = document.getElementById("tips");
        edit_el.onclick = edit;
        let all_accounts = [];

        const txt2img = async (prompt, w, h) => {
            if (!w) {
                w = 1792;
                h = 1024;
            }
            tips.innerText = "生成封面图。。";
            const url = "https://proxy-ai.doocs.org/v1/images/generations";
            try {
                const res = await fetch(url, {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({
                        prompt: prompt,
                        n: 1,
                        size: w + "x" + h,
                        model: "Kwai-Kolors/Kolors"
                    })
                });
                const data = await res.json();
                // 拼接图片地址
                const imgUrl = data.images[0].url;
                return imgUrl;
            } catch (err) {
            }
        }

        const chat = async (mg, callback) => {
            const url = "https://proxy-ai.doocs.org/v1/chat/completions";
            messages.push({role: "user", content: mg});
            const msg = {
                max_tokens: 10240,
                model: "Qwen/Qwen2.5-7B-Instruct",
                messages: messages,
                stream: true,
                temperature: 1
            }
            try {
                const res = await fetch(url, {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify(msg)
                });
                const reader = res.body.getReader();
                const decoder = new TextDecoder();
                let result = '';
                while (true) {
                    const {done, value} = await reader.read();
                    if (done) break;
                    if (value.indexOf("[DONE]") > -1) break;
                    const chunk = decoder.decode(value, {stream: true}).trim();
                    try {
                        const lines = chunk.split('"content":"')
                        for (var i = 0; i < lines.length; i++) {
                            if (lines[i].indexOf("reasoning_content") === -1) {
                                continue
                            }
                            const msg = lines[i].split('","')[0]
                            if (msg) {
                                result += msg.replaceAll("\\n", "\n")
                                    .replaceAll("\\", "")
                                    .replaceAll("```markdown", "");
                                // const content = converter.render(result);
                                if (callback) {
                                    callback(result);
                                }

                            }
                        }
                    } catch (e) {
                    }


                }
                messages.push({role: "assistant", content: result});
            } catch (err) {
            }
        }
    }catch (e){
    }
})()
