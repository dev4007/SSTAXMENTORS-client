export const saveLoginToken = (token, role) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
}

export const removeLoginToken = (token, role) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
}