throw new Error('Network response was not ok');
        }
return await response.json();
    } catch (error) {
    console.error("Failed to fetch train detail:", error);
    throw error;
}
};
