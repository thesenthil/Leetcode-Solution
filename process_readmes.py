import os
import re

for root, dirs, files in os.walk('solution'):
    for file in files:
        if file.endswith('.md'):
            filepath = os.path.join(root, file)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()

                # 1. remove edit_url
                content = re.sub(r'^edit_url:.*?\n', '', content, flags=re.MULTILINE)
                
                # 2. change github repository owner in links from "doocs/leetcode" to "thesenthil/Leetcode-Solution"
                content = content.replace('doocs/leetcode', 'thesenthil/Leetcode-Solution')
                content = content.replace('doocs', 'thesenthil')
                
                # 3. remove video links (often added as comments or badges)
                lines = content.split('\n')
                new_lines = []
                for line in lines:
                    lower_line = line.lower()
                    if ('bilibili.com' in lower_line or 'youtube.com' in lower_line or 'youtu.be' in lower_line) and not '1024.' in line and not 'snake' in lower_line and not 'die hard' in lower_line:
                        continue
                    new_lines.append(line)
                content = '\n'.join(new_lines)
                
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
            except Exception as e:
                print(f'Error processing {filepath}: {e}')

print('Done modifying READMEs')
