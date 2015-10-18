window.vsartShaders = {"vs-header":"\nattribute float vertexId;\n\nuniform vec2 mouse;\nuniform vec2 resolution;\nuniform float time;\nuniform sampler2D sound;\nuniform vec2 soundRes;\nuniform float _dontUseDirectly_pointSize;\n\nvarying vec4 v_color;\n  ","vs":"\n#define PI 3.14159\n#define NUM_SEGMENTS 21.0\n#define NUM_POINTS (NUM_SEGMENTS * 2.0)\n#define STEP 5.0\n//#define FIT_VERTICAL\n\nvec3 hsv2rgb(vec3 c) {\n  c = vec3(c.x, clamp(c.yz, 0.0, 1.0));\n  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);\n  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);\n  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);\n}\n\nvoid main() {\n  float localTime = time + 20.0;\n  float point = mod(floor(vertexId / 2.0) + mod(vertexId, 2.0) * STEP, NUM_SEGMENTS);\n  float count = floor(vertexId / NUM_POINTS);\n  float offset = count * 0.02;\n  float angle = point * PI * 2.0 / NUM_SEGMENTS + offset;\n  float radius = 0.2;\n  float c = cos(angle + localTime) * radius;\n  float s = sin(angle + localTime) * radius;\n  float orbitAngle = count * 0.01;\n  float oC = cos(orbitAngle + localTime * count * 0.01) * sin(orbitAngle);\n  float oS = sin(orbitAngle + localTime * count * 0.01) * sin(orbitAngle);\n\n  #ifdef FIT_VERTICAL\n    vec2 aspect = vec2(resolution.y / resolution.x, 1);\n  #else\n    vec2 aspect = vec2(1, resolution.x / resolution.y);\n  #endif\n\n  vec2 xy = vec2(\n      oC + c,\n      oS + s);\n  gl_Position = vec4(xy * aspect + mouse * 0.1, 0, 1);\n\n  float hue = (localTime * 0.01 + count * 1.001);\n  v_color = vec4(hsv2rgb(vec3(hue, 1, 1)), 1);\n}\n  ","vs2":"\n#define PI 3.14159\n#define NUM_SEGMENTS 4.0\n#define NUM_POINTS (NUM_SEGMENTS * 2.0)\n#define STEP 5.0\n//#define FIT_VERTICAL\n\nvec3 hsv2rgb(vec3 c) {\n  c = vec3(c.x, clamp(c.yz, 0.0, 1.0));\n  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);\n  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);\n  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);\n}\n\nvoid main() {\n  float localTime = time + 20.0;\n  float point = mod(floor(vertexId / 2.0) + mod(vertexId, 2.0) * STEP, NUM_SEGMENTS);\n  float count = floor(vertexId / NUM_POINTS);\n  float snd = texture2D(sound, vec2(fract(count / 128.0), fract(count / 20000.0))).a;\n  float offset = count * 0.02;\n  float angle = point * PI * 2.0 / NUM_SEGMENTS + offset;\n  float radius = 0.2 * pow(snd, 5.0);\n  float c = cos(angle + localTime) * radius;\n  float s = sin(angle + localTime) * radius;\n  float orbitAngle =  count * 0.0;\n  float innerRadius = count * 0.001;\n  float oC = cos(orbitAngle + localTime * 0.4 + count * 0.1) * innerRadius;\n  float oS = sin(orbitAngle + localTime + count * 0.1) * innerRadius;\n\n  #ifdef FIT_VERTICAL\n    vec2 aspect = vec2(resolution.y / resolution.x, 1);\n  #else\n    vec2 aspect = vec2(1, resolution.x / resolution.y);\n  #endif\n\n  vec2 xy = vec2(\n      oC + c,\n      oS + s);\n  gl_Position = vec4(xy * aspect + mouse * 0.1, 0, 1);\n\n  float hue = (localTime * 0.01 + count * 1.001);\n  v_color = vec4(hsv2rgb(vec3(hue, 1, 1)), 1);\n}\n  ","vs3":"\n#define NUM_SEGMENTS 128.0\n#define NUM_POINTS (NUM_SEGMENTS * 2.0)\n#define STEP 1.0\n#define NUM_LINES_DOWN 64.0\n\nvec3 hsv2rgb(vec3 c) {\n  c = vec3(c.x, clamp(c.yz, 0.0, 1.0));\n  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);\n  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);\n  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);\n}\n\nvoid main() {\n  // produces 0,1, 1,2, 2,3, ...\n  float point = floor(mod(vertexId, NUM_POINTS) / 2.0) + mod(vertexId, 2.0) * STEP;\n  // line count\n  float count = floor(vertexId / NUM_POINTS);\n\n  float u = point / NUM_SEGMENTS;    // 0 <-> 1 across line\n  float v = count / NUM_LINES_DOWN;  // 0 <-> 1 by line\n  float invV = 1.0 - v;\n\n  // Only use the left most 1/4th of the sound texture\n  // because there's no action on the right\n  float historyX = u * 0.25;\n  // Match each line to a specific row in the sound texture\n  float historyV = (v * NUM_LINES_DOWN + 0.5) / soundRes.y;\n  float snd = texture2D(sound, vec2(historyX, historyV)).a;\n\n  float x = u * 2.0 - 1.0;\n  float y = v * 2.0 - 1.0;\n  vec2 xy = vec2(\n      x * mix(0.5, 1.0, invV),\n      y + pow(snd, 5.0) * 1.0) / (v + 0.5);\n  gl_Position = vec4(xy * 0.5, 0, 1);\n\n  float hue = u;\n  float sat = invV;\n  float val = invV;\n  v_color = vec4(hsv2rgb(vec3(hue, sat, val)), 1);\n}\n  ","fs":"\nprecision mediump float;\n\nvarying vec4 v_color;\n\nvoid main() {\n  gl_FragColor = v_color;\n}\n  ","history-vs":"\nattribute vec4 position;\nattribute vec2 texcoord;\nuniform mat4 u_matrix;\nvarying vec2 v_texcoord;\n\nvoid main() {\n  gl_Position = u_matrix * position;\n  v_texcoord = texcoord;\n}\n  ","history-fs":"\nprecision mediump float;\n\nuniform sampler2D u_texture;\nvarying vec2 v_texcoord;\n\nvoid main() {\n  gl_FragColor = texture2D(u_texture, v_texcoord).aaaa;\n}\n  "}