const $root = document.getElementById("root");
const $register = document.getElementById("register");
const $textfield = document.getElementById("text");
const $posts = document.getElementById("posts");
const $focus_button = document.getElementById("focus_button");
const $theme_switch = document.getElementById("theme_logger");

let isLight;

document.addEventListener("keydown", (e) => {
  if (e.isComposing) return;
  if (document.activeElement !== $textfield && e.key === " ") {
    $textfield.focus();
    e.preventDefault();
  } else if (e.key === "Enter") {
    $register.click();
    $textfield.blur();
  }
});

$theme_switch.addEventListener("change", () => {
  isLight = $theme_switch.checked;
  if (isLight) {
    $root.classList.add("light");
    document.cookie = "theme=light;";
  } else {
    $root.classList.remove("light");
    document.cookie = "theme=dark;";
  }
});

$focus_button.addEventListener("click", () => {
  $textfield.focus();
});

$register.addEventListener("click", () => {
  if (!$textfield.value) return;
  $posts.appendChild(new Post($textfield.value, $posts).node);

  $textfield.value = "";
});

class Post {
  static posts = [];
  constructor(text, parent, id = undefined) {
    this.node = document.createElement("li");
    this.content = document.createElement("span");
    this.content.textContent = text;
    this.delbtn = document.createElement("input");
    this.delbtn.type = "checkbox";
    this.delbtn.textContent = "x";
    this.delbtn.addEventListener("change", this.delete(parent));
    this.id = id ?? new Date().getTime().toString();

    this.node.appendChild(this.delbtn);
    this.node.appendChild(this.content);

    this.node.classList.add("slidein");
    Post.posts.push(this);
    this.save();
  }

  save = () => {
    const order = Post.posts.indexOf(this);
    const obj = {
      text: this.content.textContent,
      order: order,
    };
    localStorage.setItem(this.id, JSON.stringify(obj));
  };

  delete = (parent) => () => {
    if (this.delbtn.checked) {
      this.node.classList.add("slideout");
      setTimeout(() => {
        parent.removeChild(this.node);
        Post.posts.splice(
          Post.posts.findIndex((item) => item.id === this.id),
          1
        );

        localStorage.removeItem(this.id);

        Post.posts.forEach((item) => {
          item.save();
        });

        delete this;
      }, 300);
    }
  };
}

const checkFormat = (obj) => {
  return (
    Number.isSafeInteger(obj?.order) &&
    (typeof obj?.id).toLowerCase() === "string" &&
    (typeof obj?.text).toLowerCase() === "string"
  );
};

const sleep = async (delay) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, delay * 1000);
  });
};

window.onload = async () => {
  isLight = new RegExp("theme").test(document.cookie)
    ? Object.fromEntries(
        document.cookie.split(";").map((item) => item.split("="))
      )["theme"] === "light"
    : window.matchMedia("(prefers-color-scheme: light)").matches;

  if (isLight) {
    $root.classList.add("light");
  }
  $theme_switch.checked = isLight;

  const data = Object.keys(localStorage).map((key) => {
    try {
      const obj = JSON.parse(localStorage.getItem(key));
      return { id: key, ...obj };
    } catch (e) {
      return {};
    }
  });
  const arr = new Array(data.length);
  for (const datam of data) {
    if (!checkFormat(datam)) {
      localStorage.clear();
      return;
    }
    arr[datam.order] = { id: datam.id, text: datam.text };
  }

  if (arr.includes(undefined)) {
    localStorage.clear();
    return;
  }

  localStorage.clear();
  for (const item of arr) {
    if (new Date(Number(item.id)).getDate() === new Date().getDate()) {
      $posts.appendChild(new Post(item.text, $posts, item.id).node);
      await sleep(0.05);
    }
  }
};
