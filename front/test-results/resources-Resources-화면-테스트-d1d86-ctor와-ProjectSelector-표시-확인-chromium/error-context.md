# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e4]:
    - generic [ref=e6]:
      - generic [ref=e8]: MC
      - generic [ref=e9]: MC Web Console
    - generic [ref=e10]:
      - generic [ref=e11]:
        - generic [ref=e12]: 로그인
        - generic [ref=e13]: MC Web Console에 로그인하세요
      - generic [ref=e14]:
        - generic [ref=e15]:
          - generic [ref=e16]:
            - generic [ref=e17]: 사용자 ID *
            - textbox "사용자 ID *" [disabled]:
              - /placeholder: 사용자 ID를 입력하세요
              - text: mcmp
          - generic [ref=e18]:
            - generic [ref=e19]: 비밀번호 *
            - textbox "비밀번호 *" [disabled]:
              - /placeholder: 비밀번호를 입력하세요
              - text: mcmp_password
        - generic [ref=e20]:
          - button "로그인" [disabled]:
            - img
            - text: 로그인
    - link "계정 등록" [ref=e22] [cursor=pointer]:
      - /url: "#"
  - button "Open Next.js Dev Tools" [ref=e28] [cursor=pointer]:
    - img [ref=e29]
  - alert [ref=e32]
```