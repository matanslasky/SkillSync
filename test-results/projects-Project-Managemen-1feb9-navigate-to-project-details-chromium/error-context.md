# Page snapshot

```yaml
- generic [ref=e4]:
  - banner [ref=e5]:
    - heading "SkillSync" [level=1] [ref=e6]
    - paragraph [ref=e7]: Build. Collaborate. Ship.
  - main [ref=e8]:
    - heading "Welcome Back" [level=2] [ref=e9]
    - form "Welcome Back" [ref=e10]:
      - generic [ref=e11]:
        - generic [ref=e12]: Email
        - generic [ref=e13]:
          - img [ref=e14]
          - textbox "Email" [ref=e17]:
            - /placeholder: you@example.com
      - generic [ref=e18]:
        - generic [ref=e19]: Password
        - generic [ref=e20]:
          - img [ref=e21]
          - textbox "Password" [ref=e24]:
            - /placeholder: ••••••••
          - button "Show password" [ref=e25] [cursor=pointer]:
            - img [ref=e26]
      - generic [ref=e29]:
        - checkbox "Remember me on this device" [ref=e30]
        - generic [ref=e31] [cursor=pointer]: Remember me on this device
        - generic [ref=e32]: Your email will be saved for easier login next time
      - button "Sign in to your account" [ref=e33] [cursor=pointer]:
        - img [ref=e34]
        - text: Sign In
    - generic [ref=e37]:
      - text: Don't have an account?
      - link "Create one" [ref=e38] [cursor=pointer]:
        - /url: /register
```