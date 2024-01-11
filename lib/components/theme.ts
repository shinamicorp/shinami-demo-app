import { StyleFunctionProps, extendTheme } from "@chakra-ui/react";

export const theme = extendTheme({
  styles: {
    global: {
      // styles for the `body`
      body: {
        bg: "black",
        color: "white",
      },
      a: { color: "white" },
    },
  },
  fonts: {
    heading: "var(--font-irishGrover)",
    body: "var(--font-metalMania)",
  },
  components: {
    Button: {
      baseStyle: {
        fontFamily: "var(--font-irishGrover)",
        border: "2px #FFF solid",
        transform: "skew(-10deg)",
        transition: "all 0.1s ease",
        _active: {
          transform: "skew(-10deg) scale(0.98)",
        },
        _hover: {},
      },
      sizes: {
        lg: {
          h: "56px",
          fontSize: "30px",
          px: "32px",
          minWidth: "350px",
        },
      },

      variants: {
        danger: {
          bg: "#0000009c",
          border: "2px red solid",
          borderColor: "red",
          color: "red",
          _hover: {
            boxShadow: "0px 0px 10px #F00",
          },
        },
        signIn: {
          bg: "#fff",
          fontFamily: "inter",
          border: "1px white solid",
          borderColor: "white",
          color: "black",
          width: "285px",
          height: "54px",
          fontSize: "16px",
          transform: "skew(0deg)",
          _hover: {
            boxShadow: "0px 0px 10px #ffffff99",
          },
        },
        minus: {
          bgGradient: "linear-gradient(180deg, #8D3300 27.6%, #FF4D00 100%)",
          _active: {
            bgGradient: "linear-gradient(180deg, #8D3300 27.6%, #FF4D00 90%)",
          },
          _hover: {
            boxShadow: "0px 0px 10px #F00",
          },
        },
        plus: {
          bgGradient:
            "linear-gradient(180deg, rgba(26, 120, 11, 0.70) 0%, rgba(189, 222, 173, 0.70) 100%)",
          _active: {
            bgGradient:
              "linear-gradient(180deg, rgba(26, 120, 11, 0.90) 0%, rgba(189, 222, 173, 0.90) 100%)",
          },
          _hover: {
            boxShadow: "0px 0px 10px green",
          },
        },

        solid: {
          color: "white",
          bg: "linear-gradient(180deg, rgba(120, 76, 11, 0.70) 0%, rgba(222, 202, 173, 0.70) 100%)",
          _hover: {
            bg: "linear-gradient(180deg, rgba(120, 76, 11, 0.80) 0%, rgba(222, 202, 173, 0.80), 100%)",
            boxShadow: "0px 0px 10px rgba(255, 255, 255, 0.45)",
          },
          _active: {
            bg: "linear-gradient(180deg, rgba(120, 76, 11, 0.80) 0%, rgba(222, 202, 173, 0.80) 100%)",
          },
        },
        outline: {
          color: "white",
          border: "2px #FFF solid",
          borderColor: "#FFF",
          _hover: {
            boxShadow: "0px 0px 10px rgba(255, 255, 255, 0.45)",
            bg: "none",
          },
        },
        ghost: {
          color: "white",
          border: "none",
          _hover: {
            textDecoration: "underline",
            bg: "none",
          },
          _active: {
            bg: "none",
          },
        },
      },

      defaultProps: {
        size: "lg", // default is md
      },
    },
  },
});
