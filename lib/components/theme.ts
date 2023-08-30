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
            bg: "linear-gradient(180deg, #1A780B 0%, #C8DEAD 100%)",
          },
          _active: {
            bg: "linear-gradient(180deg, #1A780B 0%, #C8DEAD 100%)",
          },
        },
        outline: {
          border: "2px #FFF solid",
          borderColor: "#FFF",
        },
      },

      defaultProps: {
        size: "lg", // default is md
      },
    },
  },
});
