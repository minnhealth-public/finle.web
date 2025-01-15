# See https://css-tricks.com/svg-symbol-good-choice-icons/ for reusing embedded SVG images in HTML document.
from typing import Optional


class Icons:
    ICONS: str = """
    <svg xmlns="http://www.w3.org/2000/svg" style="display: none;">

        <symbol id="channel-icon" viewBox="0 -960 960 960">
            <path d="m460-380 280-180-280-180v360ZM320-240q-33 0-56.5-23.5T240-320v-480q0-33 23.5-56.5
                     T320-880h480q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H320Zm0-80h480v-480
                     H320v480ZM160-80q-33 0-56.5-23.5T80-160v-560h80v560h560v80H160Zm160-720v480-480Z"/>
        </symbol>

        <symbol id="video-icon" viewBox="0 -960 960 960">
            <path d="m380-300 280-180-280-180v360ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5
            T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Z
            m0-560v560-560Z"/>
        </symbol>

        <symbol id="clip-icon" viewBox="0 -960 960 960">
            <path d="M760-120 480-400l-94 94q8 15 11 32t3 34q0 66-47 113T240-80q-66 0-113-47T80-240
            q0-66 47-113t113-47q17 0 34 3t32 11l94-94-94-94q-15 8-32 11t-34 3q-66 0-113-47T80-720
            q0-66 47-113t113-47q66 0 113 47t47 113q0 17-3 34t-11 32l494 494v40H760ZM600-520l-80-80 240-240
            h120v40L600-520ZM240-640q33 0 56.5-23.5T320-720q0-33-23.5-56.5T240-800q-33 0-56.5 23.5T160-720
            q0 33 23.5 56.5T240-640Zm240 180q8 0 14-6t6-14q0-8-6-14t-14-6q-8 0-14 6t-6 14q0 8 6 14t14 6Z
            M240-160q33 0 56.5-23.5T320-240q0-33-23.5-56.5T240-320q-33 0-56.5 23.5T160-240q0 33 23.5 56.5
            T240-160Z"/>
        </symbol>

    </svg>
    """

    @classmethod
    def get_init_svg(cls) -> str:
        return cls.ICONS

    @classmethod
    def get_link_svg(cls, symbol: str, klass: Optional[str] = None) -> str:
        if klass is None:
            return f'<svg><use xlink:href="#{symbol}" /></svg>'
        else:
            return f'<svg class="{klass}"><use xlink:href="#{symbol}" /></svg>'
