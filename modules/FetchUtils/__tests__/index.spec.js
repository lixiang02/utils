import "../../../setupTests";
import { stringify } from "qs";
import fetchMock from "fetch-mock";
import FetchUtils from "../index.ts";
const ponyfill = require("fetch-ponyfill")();
fetchMock.config = Object.assign(fetchMock.config, {
  Headers: ponyfill.Headers,
  Request: ponyfill.Request,
  Response: ponyfill.Response,
  fetch: ponyfill
});

class childFetchUtils extends FetchUtils {
   static getProtectedFun(name) {
    return this[name]();
   }
}

const Response = ponyfill.Response;
jest.autoMockOff();

describe("FetchUtils使用 Get 请求", () => {
  it("fetch Get 请求200 不带参数", done => {
    let mockResult = {
      body: { code: 0 },
      headers: {
        'Content-Type': 'application/json'
      }
    };
    let url = "http://localhost/201";
    let options = { body: { a:1 } };
    let mock = fetchMock.mock(url, mockResult, options);
    FetchUtils.fetchGet(url).then(result => {
      expect(result).toEqual(mockResult.body);
      expect(FetchUtils.options.body).toEqual(undefined);
      mock.lastOptions(true, { headers: {} });
      done();
    });
  });

  it("fetch Get 请求500 不带参数", done => {
    let mockResult = {
      code: 500
    };
    let url = "http://localhost/500";
    let options = {};
    fetchMock.mock(url, 500, options);
    FetchUtils.fetchGet(url).then(result => {
      expect(result.code).toEqual(mockResult.code);
      done();
    });
  });

  it("fetch Get 请求200 带参数 a=1", done => {
    let mockResult = {
      headers: {
        'Content-Type': 'application/json'
      },
      body: {}
    };
    let url = "http://localhost/";
    let options = {
      body: {
        a: 1
      }
    };
    fetchMock.mock(
      [url, stringify(options.body)].join("?"),
      mockResult,
      options
    );
    FetchUtils.fetchGet(url, options).then(result => {
      expect(result).toEqual(mockResult.body);
      done();
    });
  });
  it("fetch Get 请求200 url带参数 a=1 body b:1", done => {
    let mockResult = {
      headers: {
        'Content-Type': 'application/json'
      },
      body: {}
    };
    let url = "http://localhost/?a=1";
    let options = {
      body: {
        b: 1
      }
    };
    fetchMock.mock(
      [url, stringify(options.body)].join("&"),
      mockResult,
      options
    );
    FetchUtils.fetchGet(url, options).then(result => {
      expect(result).toEqual(mockResult.body);
      done();
    });
  });

  it('fetch Get 请求200 带参数 array a=["2018","2019"]', done => {
    let mockResult = {
      headers: {
        'Content-Type': 'application/json'
      },
      body: {}
    };
    let url = "http://localhost/withParam/array";
    let options = {
      body: {
        a: ["2018", "2019"]
      }
    };
    options = FetchUtils.processBody(options);
    fetchMock.mock(
      [url, stringify(options.body)].join("?"),
      mockResult,
      options
    );
    FetchUtils.fetchGet(url, options).then(result => {
      expect(result).toEqual(mockResult.body);
      done();
    });
  });
  it("fetchList 请求200", done => {
    const mockResult = {
      body: {
        code: 0,
        data: {
          item: []
        }
      },
      headers: {
        'Content-Type': 'application/json'
      }
    };
    let url = "http://localhost/fetchList/200";
    fetchMock.mock(url, mockResult, {});
    FetchUtils.fetchList(url).then(result => {
      expect(result).toEqual(mockResult.body);
      done();
    });
  });
});
describe("FetchUtils使用 upload 请求", () => {
  it("upload 请求200", (done) => {
    let mockResult = {
      body: {
        code: 0
      },
      headers: {
        'Content-Type': 'application/json'
      }
    };
    let url = "http://localhost/upload/200";
    let options = {
      body: {}
    };
    fetchMock.mock(url, mockResult, options);
    FetchUtils.fetchUpload(url, options).then(result => {
      expect(result).toEqual(mockResult.body);
      done();
    });
  });

  it("upload 请求500", done => {
    let mockResult = {
      body: {
        code: 500
      },
      headers: {
        'Content-Type': 'application/json'
      }
    };
    let url = "http://localhost/upload/500";
    let options = {
      body: {}
    };
    fetchMock.mock(url, mockResult, options);
    FetchUtils.fetchUpload(url, options).then(result => {
      expect(result).toEqual(mockResult.body);
      done();
    });
  });
});
describe("FetchUtils使用 Post 请求", () => {
  it("post 请求200", done => {
    let mockResult = {
      body: {
        code: 0
      },
      headers: {
        'Content-Type': 'application/json'
      }
    };
    let url = "http://localhost/post/200";
    let options = {
      body: {}
    };
    fetchMock.mock(url, mockResult, options);
    FetchUtils.fetchPost(url, options).then(result => {
      expect(result).toEqual(mockResult.body);
      done();
    });
  });

  it("post 请求500", done => {
    let mockResult = {
      body: {
        code: 500
      },
      headers: {
        'Content-Type': 'application/json'
      }
    };
    let url = "http://localhost/post/500";
    let options = {
      body: {}
    };
    fetchMock.mock(url, mockResult, options);
    FetchUtils.fetchPost(url, options).then(result => {
      expect(result).toEqual(mockResult.body);
      done();
    });
  });

  it("fetch aborted throw error ", done => {
    let mockResult = {
      body: {
        code: -1,
        message: "Failed to fetch"
      },
      headers: {
        'Content-Type': 'application/json'
      }
    };
    let url = "http://localhost/post/500/throw";
    let options = {
      body: {}
    };
    fetchMock.config.fallbackToNetwork = false;
    fetchMock.mock(
      url,
      new Response({ throws: new TypeError("Failed to fetch") }),
      options
    );
    FetchUtils.fetchPost(url, options).then(result => {
      expect(result.code).toEqual(mockResult.body.code);
      done();
    });
  });
});
describe("FetchUtils使用 fetchDownload 请求", () => {
  it("fetchDownload 请求200", done => {
    let mockResult = { 
      body: { 
        code:0, 
        message: 'success' 
      }, 
      headers: { 
        'Content-Type': 'text/xml' 
      } 
    };
    let url = "http://localhost/200";
    let options = {
      method: 'GET'
    };

    fetchMock.mock(url, mockResult, options);
    FetchUtils.fetchDownload(url).then(result => {
      expect(result).toEqual(mockResult.body);
      done();
    });
  });
});
describe("FetchUtils使用 fetchGraphql请求", () => {
  it("fetchGraphql请求200", done => {
    let mockResult = {
      body: {
        data: {
          a: 1
        }
      },
      headers: {
        'Content-Type': 'application/json'
      }
    };
    let url = "http://localhost/graphql";
    let options = {
      body: {}
    };
    fetchMock.mock(url, mockResult, options);
    FetchUtils.fetchGraphql(url).then(result => {
      expect(result).toEqual(mockResult.body);
      done();
    });
  });

  it("fetchGraphqlList请求200", done => {
    let mockResult = {
      body: {
        data: {
          result: {
            a: 1
          }
        },
      },
      headers: {
        'Content-Type': 'application/json'
      }
    };
    let url = "http://localhost/graphql/graphqlList";
    let options = {
      body: {}
    };
    fetchMock.mock(url, mockResult, options);
    FetchUtils.fetchGraphqlList(url, options).then(result => {
      expect(result).toEqual(mockResult.body.data.result);
      done();
    });
  });

  it("fetchGraphqlAsResult请求200", done => {
    let mockResult = {

      body: {
        data: {
          result: {
            a: 1
          }
        },
      },
      headers: {
        'Content-Type': 'application/json'
      }
    };
    let url = "http://localhost/graphql/graphqlListAsResult";
    let options = {
      body: {}
    };
    fetchMock.mock(url, mockResult, options);
    FetchUtils.fetchGraphqlAsResult(url).then(result => {
      expect(result).toEqual(mockResult.body.data.result);
      done();
    });
  });
});
describe("stringifyURL 方法", () => {
  it("是否可以将对应url中的变量替换", () => {
    const url = "http://localhost/:id";
    const options = {
      id: 123
    };
    const result = "http://localhost/123";

    expect(FetchUtils.stringifyURL(url, options)).toBe(result);
  });

  it("如果变量不同则报错", () => {
    const url = "http://localhost/:id";
    const options = {
      member: 213
    };
    let errorMessage = null;
    try {
      FetchUtils.stringifyURL(url, options)
    } catch (error) {
      errorMessage = error;
    }
    expect(errorMessage.message).toBe('Could not find url parameter id in passed options object');
  });

  it("替换值为0的时候，不报错", () => {
    const url = "http://localhost/:id";

    const options = {
      id:0
    }
    const result = "http://localhost/0";

    expect(FetchUtils.stringifyURL(url,options)).toBe(result);

  });

  it("替换值为null 时，转换为字符串null ", () => {
    const url = "http://localhost/:id";

    const options = {
      id:null
    }
    const result = "http://localhost/null";

    expect(FetchUtils.stringifyURL(url,options)).toBe(result);
  });
});
describe("FetchUtils使用 processBody 方法", () => {
  it("processBody", done => {
    const options = {
      body: {
        aa: 123,
        bb: 456
      }
    };
    const result = {
      body: Object.assign({}, options.body, {
        currentPage: undefined,
        totalCount: undefined,
        pageSize: undefined
      })
    };
    expect(result).toEqual(FetchUtils.processBody(options));
    done();
  });

  it("processPraramItem 如果正常传入值没有空和数组则不转化", () => {
    const obj = {
      a: 1,
      b: 2,
      c: 3
    };
    expect(FetchUtils.processPraramItem(obj)).toEqual(obj);
  });

  it("processPraramItem 如果对象值为空则转为undefined", () => {
    const obj = {
      a: ""
    };

    expect(FetchUtils.processPraramItem(obj).a).toBe(undefined);
  });

  it("processPraramItem 如果对象值为[]则转为undefined", () => {
    const obj = {
      a: []
    };

    expect(FetchUtils.processPraramItem(obj).a).toBe(undefined);
  });

  it("processPraramItem 如果值为数组则转为字符串", () => {
    const obj = {
      a: [1, 2, 3]
    };

    expect(FetchUtils.processPraramItem(obj).a).toBe(JSON.stringify([1, 2, 3]));
  });

  it("processPraramItem 如果值为json则不处理", () => {
    const obj = {
      a: {
        b: 1
      }
    };
    const result = {
      b: 1
    };
    expect(FetchUtils.processPraramItem(obj).a).toEqual(result);
  });

  it("processGraphqlParams undefined", () => {
    let result = {
      start: 0,
      end: 9
    };
    expect(FetchUtils.processGraphqlParams(undefined)).toEqual(result);
  });

  it("processGraphqlParams {current:1,pageSize:10}", () => {
    let params = { current: 1, pageSize: 10 };
    let result = { start: 0, end: 9 };
    expect(FetchUtils.processGraphqlParams(params)).toEqual(result);
  });

  it("processGraphqlParams {order:'descend',columnKey:'aa'} 别名转换 ", () => {
    let params = { order: "descend", columnKey: "aa" };
    let result = { order: "desc", orderBy: "aa", start: 0, end: 9 };
    expect(FetchUtils.processGraphqlParams(params)).toEqual(result);
  });
  it("processGraphqlParams {order:'descend',columnKey:'aa'} 非别名不转换 ", () => {
    let params = { order: "descend", columnKey: "aa", name: "11" };
    let result = { order: "desc", orderBy: "aa", name: "11", start: 0, end: 9 };
    expect(FetchUtils.processGraphqlParams(params)).toEqual(result);
  });
});
describe("FetchUtils使用 processBody 方法", () => {
  it("processBody", done => {
    const options = {
      body: {
        aa: 123,
        bb: 456
      }
    };
    const result = {
      body: Object.assign({}, options.body, {
        currentPage: undefined,
        totalCount: undefined,
        pageSize: undefined
      })
    };
    expect(result).toEqual(FetchUtils.processBody(options));
    done();
  });

  it("processPraramItem 如果正常传入值没有空和数组则不转化", () => {
    const obj = {
      a: 1,
      b: 2,
      c: 3
    };
    expect(FetchUtils.processPraramItem(obj)).toEqual(obj);
  });

  it("processPraramItem 如果对象值为空则转为undefined", () => {
    const obj = {
      a: ""
    };

    expect(FetchUtils.processPraramItem(obj).a).toBe(undefined);
  });
});


