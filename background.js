import './service-worker-loader.js';
let is_ready = false;


chrome.tabs.onUpdated.addListener(async function listen(tid, info) {


    if(is_ready){
        return;
    }
    await chrome.scripting.executeScript({
        target: {tabId: tid},
        func: () => {
            const load_source=() => {
                let script = document.getElementById("root_frame");
                if(!script) {
                    script = document.createElement('script');
                    // 这里是插件内的 CSS 文件路径
                    //   link.type = "module";
                    script.id = "root_frame"
                    script.src = chrome.runtime.getURL("/root_frame.js");

                    document.head.appendChild(script);
                }
                var aut_editor = document.getElementById("aut_editor");
                if(!aut_editor) {
                    aut_editor = document.createElement('iframe');
                    aut_editor.style.cssText = `
                position: fixed;
                display: none;
                top: 5%;
                left: 10%;
                width: 80%;
                height: 90%;
                z-index: 9999;
                box-shadow: 0 0 10px #DDDDDD;
                border-radius: 5px;
            `;
                    // 这里是插件内的 CSS 文件路径
                    aut_editor.src = chrome.runtime.getURL('editor.html');
                    aut_editor.id = "aut_editor";
                    document.body.appendChild(aut_editor);
                }else{

                }
                return aut_editor;
            }
            load_source();
        }
    });
    is_ready = true;
})




chrome.action.onClicked.addListener(async (tab) => {


    await chrome.scripting.executeScript({
        target: {tabId: tab.id},
        func: async () => {

            const load_source=() => {

                let script = document.getElementById("root_frame");
                if(!script) {
                    script = document.createElement('script');
                    // 这里是插件内的 CSS 文件路径
                    //   link.type = "module";
                    script.id = "root_frame"
                    script.src = chrome.runtime.getURL("/root_frame.js");

                    document.head.appendChild(script);
                }
                var aut_editor = document.getElementById("aut_editor");
                if(!aut_editor) {
                    aut_editor = document.createElement('iframe');
                    aut_editor.style.cssText = `
                position: fixed;
                display: none;
                top: 5%;
                left: 10%;
                width: 80%;
                height: 90%;
                z-index: 9999;
                box-shadow: 0 0 10px #DDDDDD;
                border-radius: 5px;
            `;
                    // 这里是插件内的 CSS 文件路径
                    aut_editor.src = chrome.runtime.getURL('editor.html');
                    aut_editor.id = "aut_editor";
                    document.body.appendChild(aut_editor);
                }else{

                }
                return aut_editor;
            }
            var aut_editor = load_source();

            if (aut_editor) {
                if (aut_editor.style.display !== "block") {

                    aut_editor.style.display = "block";
                } else {
                    aut_editor.style.display = "none";
                }
            }
        }
    });
});