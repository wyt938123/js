<script>
    import md5 from "md5";
interface Params {
  uri: string;
  method: string;
  data: any;
  noReportResTime?: boolean;
  isAbort?: boolean;
  header?: Object;
}
export default class Request {
  baseURL: string;
  header: Object;
  timeout = 5000;

  constructor(config) {
    this.baseURL = config.baseURL;
    this.header = config.header;
  }

  setRequestHeader(xhr: XMLHttpRequest, header: any = {}) {
    let nextHeader = Object.assign({}, this.header, header);
    for (let key of Object.getOwnPropertyNames(nextHeader)) {
      xhr.setRequestHeader(key, nextHeader[key]);
    }
    // console.log('[setRequestHeader]')
  }

  request(param: Params): Promise<any> {
    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest();
      let header;
      if (param?.header) {
        header = param?.header;
        delete param.header;
      }
      let url = this.baseURL + param.uri;
      if (
        url.indexOf("?") == -1 &&
        param.data &&
        param.method.toLocaleLowerCase() === "get"
      ) {
        url += "?";
        for (let i in param.data) {
          url += i + "=" + param.data[i] + "&";
        }
        url = url.substr(0, url.length - 1);
      }
      // console.log('[xhr][url]', url)
      // console.log('[xhr][method]', param.method)
      // console.log('[xhr][data]', JSON.stringify(param.data))
      let startTime = Date.now();
      let timer = null,
        isRes = false;
      xhr.open(param.method, url, true);
      this.setRequestHeader(xhr, header);
      xhr.send(
        (param.method.toLocaleLowerCase() === "post" && param.data) || null
      );
      timer = setTimeout(() => {
        if (!isRes && (!param.noReportResTime || param.isAbort)) {
          console.log("[xhr][abort]");
          reject({ DESC: "timeout" });
          xhr && xhr.abort();
          xhr = null;
        }
        timer = null;
      }, this.timeout);
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 && !isRes) {
          isRes = true;
          clearTimeout(timer);
          // console.log('[onreadystatechange]', xhr.readyState, '-', xhr.status)
          let diffTime = Date.now() - startTime;
          if (diffTime > 2000 && !param.noReportResTime) {
            this.reportInterfaceTime({
              event_id: "interface_time",
              event_name: "接口响应时长",
              ext_field_1: diffTime,
              page_url: url,
            });
          }
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(xhr.responseText);
          } else {
            reject({ status: xhr.status, statusText: xhr.statusText });
          }
          xhr = null;
        }
      };
      xhr.onerror = (err) => {
        reject({ status: xhr.status, statusText: xhr.statusText });
      };
    });
  }

  reportInterfaceTime(data) {
    let datas = {
      ...(window?.Global?.reportData || {}),
      ...data,
      platform: "Quickgame",
      brand: "oppo",
    };
    let xhr = new XMLHttpRequest();
    // https://fastgame-logs.yunyihudong.com/ https://devdata.muchcloud.com:8082/
    let url =
      "https://fastgame-logs.yunyihudong.com/" +
      (datas.cdnReferer || datas.referer);
    xhr.open("post", url, true);
    let Xts = Math.round(Date.now() / 1000);
    let header = {
      "content-type": "application/json; charset=utf-8",
      "accept-language": "zh-CN",
      Xts,
      Xsign: md5("/yunyousj@2021" + Xts),
    };
    for (let key of Object.getOwnPropertyNames(header)) {
      xhr.setRequestHeader(key, header[key]);
    }
    xhr.send(JSON.stringify(datas));
    xhr.onreadystatechange = () => {
      // xhr = null
    };
  }
}

</script>