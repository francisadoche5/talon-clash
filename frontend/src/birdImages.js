// Bird evolution images — ordered from weakest (1) to strongest (7)
export const BIRD_IMAGES = {
  1: {
    url: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjAxaDYwg024c552MiQDewIvWBKoJCOxRO9mREYZa3HnQHxiteyzryPZwc6wtlhX8Zu_RKXvcsQz9E6_P9LL68HHyAu3Y6zumNDwwHZR-BNoV5Mdh5Wx9BPZG5_T95eIDLwgRp0Z-85C2zVgrN5oZ34wmdgZvT9GsDi68NTFh1ezUB5itZfHGcJ_xF4KBU/w320-h320/file_000000014847246b80a48fe533f31d5.png',
    name: 'Hatchling',
  },
  2: {
    url: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgkEM1c9aXPGUofejX89ARhHMeiLcNRPZU6j7ouIqKKV5zr_RxDuu3Lh6pNpW0zfh0WL43ad2pQlZrsAbeLvS0D6kCMP49ml9n81rRrtBCNWR4ZOXPQjmI1soUqwst6LPhS3-nQIDL9sgXIz80sXnw8TRbh21yukHeo_8YGr_RN24QnFYDqVkSpWVFIbuA/w320-h320/file_000000007a1072469dd84108e55402bd.png',
    name: 'Fledgling',
  },
  3: {
    url: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhl-SC2oAmZNWzb8n6kQfNp8B7gfScgaMOOq6sXdP84kg0awt3pThCyxDtCgonv4w7IexpDh29DmlHpXKURTSm6vRMXxBAbfDsm95N9FVR_VjqV2Qm3lcM3a8dgj2ROgjtp5LvRLS65gfY72H92oETKhMwcXEeJz_XWNNqT0DWBHxVt62QvxwsoayQAIsA/w320-h320/file_000000009648724 6931a2c0dbec005f0.png',
    name: 'Sparrow Warrior',
  },
  4: {
    url: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi-nOZjlN1JOGFZcv6_KVl1dRnYLWRlfPiC2_T216tFp9RiwUy9uxblb0iSbPm8zeHMuB38KBWIpwRqjib4rpBfa_UTbinkAx1pEN4kv84nZrcwypvDHqw_7LB6s01w-XXV0pKm38DOAxWIIG2zYbevrK2a_qaDE7VWt9V41QCNWFh-CZe93Zl2oMjnfsI/w320-h320/file_00000000013871f4a4b71b74836d094a.png',
    name: 'Falcon Knight',
  },
  5: {
    url: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiChIRjhSDALwlWkeVULD-mbUS5_Je_I48D2hl0skdJyMCYp8AN-g2IS45rdOk8ZLycmmu985zj97zfa2tkT0J_mydTmWKstBqo5J3GDpBQjfWtptamcl4g6T9lKsCSt6l_jj64Prtm6ukeBumM5LrI1AFUKgo1621UoDMnb9zUO7KzYA2FWDvMF8va3GI/w320-h320/file_000000004e0471f4ac3392179d653351.png',
    name: 'War Hawk',
  },
  6: {
    url: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhBO-M8JkvOmKe0hTAcRSLuyoSU9OwpuRn9L7YzTf4Yj5yunbX0QQ4aCgPqysMJdiW4n43b0V94u-0rq7iZFkiTdyMAVr0EURk_AjBL-OHFwl13Zv9EVFHZQz7lF66ZCNkKWrGLczDNUmfXDs1f1SCULQxR3JT5RHo6uBRwPYqslSnwpB7I2LHSa8V6oTE/w320-h320/file_00000000c7547243ad91c9ed0ef799d3.png',
    name: 'Eagle Champion',
  },
  7: {
    url: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhTbdJZRDMye4LCfk_iA4HLuaQHeXyzTS5CkFFpS6Pqhr5cKnIG99zyXeJ1ytAcbuhZZSathp1E3y7rSR6WkeMPDUbZN7Aqcohlf3zBTFsf-BzJros40QTDswAlwUMD4-Ln4OzOMqm5ThPzzLMmmSxsn6zMcP3oXFfb5m2a20eKRJuekp9sX8AOiVsB92s/w320-h320/file_000000007d3871f4ab13bc841fa74a5b.png',
    name: 'Shadow Eagle',
  },
};

// Helper: get image URL by tier (falls back to tier 1)
export function getBirdUrl(tier) {
  return (BIRD_IMAGES[tier] || BIRD_IMAGES[1]).url;
}

// Helper: get bird name by tier
export function getBirdName(tier) {
  return (BIRD_IMAGES[tier] || BIRD_IMAGES[1]).name;
}

// The tier-6 Eagle Champion image used as a generic eagle icon across the app
export const EAGLE_ICON_URL = BIRD_IMAGES[6].url;
