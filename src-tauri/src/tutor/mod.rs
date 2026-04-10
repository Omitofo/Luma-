pub mod casual;
pub mod academic;

pub fn get_prompt(mode: &str) -> String {
    match mode {
        "academic" => academic::prompt(),
        _ => casual::prompt(),
    }
}