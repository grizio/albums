mod utils;

use wasm_bindgen::prelude::*;
use wasm_bindgen::__rt::IntoJsResult;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
extern {
    fn log(s: &str);
}


#[wasm_bindgen]
pub fn encrypt(data: &str, key: &str) -> Result<JsValue, JsValue> {
    // Yes, use a real encryption, it is for the POC
    format!("{}{}", data, key).into_js_result()
}

#[wasm_bindgen]
pub fn decrypt(data: &str, key: &str) -> Result<JsValue, JsValue> {
    // Yes, use a real encryption, it is for the POC
    if data.ends_with(key) {
        data[0..(data.len() - key.len())].into_js_result()
    } else {
        "".into_js_result()
    }
}