import { StyleFunctionProps, extendTheme } from "@chakra-ui/react";

export const theme = extendTheme({
  fonts: {
    heading: "var(--font-irishGrover)",
    //body: "var(--font-irishGrover)",
  },
  components: {
    Button: {
      // 1. We can update the base styles
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
        "with-shadow": {
          bg: "red.400",
          boxShadow: "0 0 2px 2px #efdfde",
        },

        solid: {
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
          border: "2px #FFF solid",
          borderColor: "#FFF",
          _hover: {
            boxShadow: "0px 0px 10px rgba(255, 255, 255, 0.45)",
          },
        },
        ghost: {
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
