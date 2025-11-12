export const capitalize = (str) => {
    if (!str)
        return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
};
export const camelCase = (str) => {
    return str
        .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => index === 0 ? word.toLowerCase() : word.toUpperCase())
        .replace(/\s+/g, '');
};
export const kebabCase = (str) => {
    return str
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/[\s_]+/g, '-')
        .toLowerCase();
};
//# sourceMappingURL=string.js.map